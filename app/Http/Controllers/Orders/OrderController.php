<?php

namespace App\Http\Controllers\Orders;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderRequest;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderSpList;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        $countCart = Cart::query()->where('is_code_cust_id', Auth::user()->is_code_cust_id)
            ->where('is_active', false)
            ->count();
        return Inertia::render('Orders/OrderList',['count_cart' => $countCart ?? 0,]);
    }

    public function search($sku): JsonResponse
    {
        $Api = env('VITE_API_ORDER');
        $imagePath = env('VITE_IMAGE_PATH');
        $message = '';
        $result = [];
        $status = 500;
        try {
            $response = Http::post($Api, ['pid' => $sku, 'view' => 'single']);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['status']) && $data['status'] === 'SUCCESS') {
                    $status = 200;
                    $result = $data['assets'][0];
                    foreach ($result['sp'] as $key => $resultItem) {
                        $result['sp'][$key] = $resultItem;
                        $result['sp'][$key]['skufg'] = $sku;
                        $result['sp'][$key]['pname'] = $data['assets'][0]['pname'];
                        $result['sp'][$key]['imagesku'] = $data['assets'][0]['imagesku'];
                        $Carts = Cart::query()
                            ->where('sp_code', $result['sp'][$key]['spcode'])
                            ->where('is_active', false)
                            ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                            ->first();
                        if ($Carts) {
                            $result['sp'][$key]['added'] = true;
                        }else{
                            $result['sp'][$key]['added'] = false;
                        }
                        $result['sp'][$key]['path_file'] = "https://images.pumpkin.tools/SKUS/SP/$sku/" . $result['sp'][$key]['spcode'] . ".jpg";
                    }

                } else throw new \Exception('ไม่พบรหัสสินค้านี้');
            } else throw new \Exception('มีปัญหากับ API');
        } catch (\Exception $e) {
            $message = $e->getMessage();
            $status = 400;
        }
        return response()->json([
            'message' => $message,
            'sku' => $sku,
            'result' => $result,
        ], $status);
    }

    public function store(OrderRequest $request): JsonResponse
    {
        $spList = $request->input('spList');

        try {
            DB::beginTransaction();
            $is_code_cust_id = auth()->user()->is_code_cust_id;
            $user_code = auth()->user()->user_code;
            $order_id = 'ORDER-' . time() . rand(1000, 9999);
            $order = Order::query()->create([
                'order_id' => $order_id,
                'is_code_key' => $is_code_cust_id,
                'user_key' => $user_code,
                'buy_at' => Carbon::now(),
                'address' => $request->input('address') . $request->input('phone'),
            ]);
            if (!$order) throw new \Exception('ไม่สามารถสร้าง order ได้');
            $dataSp = [];
            foreach ($spList as $key => $sp) {
                $orderSp = OrderSpList::query()->create([
                    'order_id' => $order_id,
                    'sp_code' => $sp['spcode'],
                    'sp_name' => $sp['spname'],
                    'sku_code' => $sp['skufg'],
                    'qty' => $sp['quantity'],
                    'price_per_unit' => $sp['price_per_unit'],
                    'sp_unit' => $sp['spunit'],
                    'path_file' => $sp['path_file'],
                ]);
                $dataSp[$key] = $orderSp;
            }
            DB::commit();
            $message = 'success';
            $status = 200;
        } catch (\Exception $e) {
            DB::rollBack();
            $message = $e->getMessage();
            $status = 400;
        }

        return response()->json([
            'spList' => $spList,
            'message' => $message,
            'order' => $order ?? [],
            'dataSp' => $dataSp ?? [],
        ], $status);
    }

    public function history(): Response
    {
        $history = Order::query()
            ->where('is_code_key', auth()->user()->is_code_cust_id)
            ->orderBy('id', 'desc')->paginate(100);
        return Inertia::render('Orders/OrderHistory', ['history' => $history]);
    }

    public function historyDetail($order_id): Response|RedirectResponse
    {
        $order = Order::query()->where('order_id', $order_id)->first();
        $listSp = OrderSpList::query()->where('order_id', $order_id)->get();
        if (!$order) return redirect()->route('unauthorized');
        $customer = User::query()->where('is_code_cust_id', $order->is_code_key)->first();
        $totalPrice = 0;
        foreach ($listSp as $sp) {
            $totalPrice += $sp->price_per_unit * $sp->qty;
        }
        $order['totalPrice'] = round($totalPrice, 2);
        return Inertia::render('Orders/OrderHistoryDetail', ['order' => $order, 'listSp' => $listSp, 'customer' => $customer]);
    }

    public function orderSuccess(): Response
    {
        return Inertia::render('Orders/OrderSuccess');
    }


//    Cart Controller

    public function cartList(): Response
    {
        $sku_image_path = env('VITE_IMAGE_SKU');
        $groupSku = Cart::query()->where('is_code_cust_id', Auth::user()->is_code_cust_id)
            ->where('is_active', false)
            ->select('sku_code', 'sku_name')
            ->groupBy('sku_code', 'sku_name')
            ->get();
        $totalSp = 0;
        foreach ($groupSku as $key => $group) {
            $group['sku_image_path'] = $sku_image_path . $group['sku_code'] . ".jpg";
            $group['list'] = Cart::query()->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('is_active', false)
                ->where('sku_code', $group->sku_code)
                ->get();
            $totalSp += $group['list']->count();

        }
        return Inertia::render('Orders/carts/CartList', ['groupSku' => $groupSku, 'totalSp' => $totalSp]);
    }

    public function addCart(Request $request){
        try {
            $cart = Cart::query()->create([
                'is_code_cust_id' => auth()->user()->is_code_cust_id,
                'user_code_key' => auth()->user()->user_code,
                'sku_code' => $request->skufg,
                'sku_name' => $request->pname,
                'sp_code' => $request->spcode,
                'sp_name' => $request->spname,
                'price_per_unit' => floatval($request->price_per_unit),
                'sp_unit' => $request->spunit,
            ]);
            return response()->json([
                'message' => 'success',
                'cart' => $cart
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function AddOrRemoveQtySp(Request $request, $condition = 'add'): JsonResponse
    {
        try {
            $sp = Cart::query()->findOrFail($request->id);
            DB::beginTransaction();
            if ($condition === 'add') {
                $sp->update(['qty' => $sp->qty + 1]);
            } else {
                if ($sp->qty > 1) {
                    $sp->update(['qty' => $sp->qty - 1]);
                } else {
                    return response()->json([
                        'message' => 'Cannot reduce quantity below 1'
                    ], 400);
                }
            }
            DB::commit();
            return response()->json([
                'message' => 'success',
                'sp' => $sp->fresh()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createOrder(Request $request): JsonResponse
    {
        try {
            // ตรวจสอบว่ามีข้อมูล groups หรือไม่
            if (!$request->has('groups') || empty($request->groups)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'ไม่พบข้อมูลสินค้าในตะกร้า'
                ], 400);
            }

            $groups = $request->groups;

            // สร้าง Order ID ที่ไม่ซ้ำกัน
            $order_id = 'ORDER-' . time() . rand(1000, 9999);

            // เริ่ม Transaction
            DB::beginTransaction();

            $order = Order::query()->create([
                'order_id' => $order_id,
                'is_code_key' => auth()->user()->is_code_cust_id,
                'user_key' => auth()->user()->user_code,
                'buy_at' => Carbon::now(),
                'status' => 'pending',
                'address' => $request->address ?? auth()->user()->store_info->address,
            ]);


            $totalOrderPrice = 0;

            foreach ($groups as $group) {
                if (!isset($group['list']) || empty($group['list'])) {
                    continue; // ข้ามกลุ่มที่ไม่มีสินค้า
                }

                $spList = $group['list'];
                foreach ($spList as $spItem) {
                    // ตรวจสอบว่ามี ID และสามารถค้นหาในฐานข้อมูลได้
                    if (!isset($spItem['id'])) {
                        continue;
                    }

                    try {
                        $sp = Cart::query()->findOrFail($spItem['id']);

                        // อัปเดตสถานะในตะกร้า
                        $sp->update(['is_active' => true]);

                        // คำนวณราคารวมของสินค้า
                        $qty = $spItem['qty'] ?? 1;
                        $pricePerUnit = $spItem['price_per_unit'] ?? 0;
                        $itemTotalPrice = $qty * $pricePerUnit;
                        $totalOrderPrice += $itemTotalPrice;

                        // ตรวจสอบและแก้ไขเส้นทางไฟล์
                        $skuCode = $group['sku_code'] ?? $sp['sku_code'];
                        $pathFile = env('VITE_IMAGE_SP') . $skuCode . "/" . $sp['sp_code'] . ".jpg";
                        // บันทึกรายการสินค้าในออเดอร์
                        $orderSpList = OrderSpList::query()->create([
                            'order_id' => $order_id,
                            'sp_code' => $sp['sp_code'],
                            'sp_name' => $sp['sp_name'],
                            'sku_code' => $skuCode,
                            'qty' => $qty,
                            'price_per_unit' => $pricePerUnit,
                            'sp_unit' => isset($sp['sp_unit']) ? $sp['sp_unit'] : 'ชิ้น',
                            'path_file' => $pathFile,
                        ]);


                    } catch (\Exception $e) {
                        // บันทึก log หากมีข้อผิดพลาดกับสินค้าบางรายการ แต่ยังดำเนินการต่อ
                        Log::error('Error processing item: ' . $e->getMessage(), [
                            'item_id' => $spItem['id'] ?? 'unknown',
                            'order_id' => $order_id
                        ]);
                    }
                }
            }

            // อัปเดตราคารวมของออเดอร์
            $order->update(['total_price' => $totalOrderPrice]);

            // ยืนยัน Transaction
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'สร้างคำสั่งซื้อเรียบร้อยแล้ว',
                'order' => [
                    'order_id' => $order_id,
                    'total_price' => $totalOrderPrice,
                    'buy_at' => $order->buy_at,
                    'order' => $order
                ],
            ], 200);

        } catch (\Exception $e) {
            // ยกเลิก Transaction หากเกิดข้อผิดพลาด
            DB::rollBack();

            Log::error('Order creation failed: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ กรุณาลองใหม่ภายหลัง',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function deleteCart($id): JsonResponse
    {
        try {
            $cart = Cart::query()->findOrFail($id);
            $cart->delete();
            return response()->json([
                'message' => 'success',
                'cart' => $cart
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }


}
