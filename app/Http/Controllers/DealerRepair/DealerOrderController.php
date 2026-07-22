<?php

namespace App\Http\Controllers\DealerRepair;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderSpList;
use App\Models\StoreInformation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DealerOrderController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('DealerPage/Orders/DealerOrderDiagram');
    }

    public function searchSpJson(Request $request): JsonResponse
    {
        $sku = trim($request->sku ?? '');
        $dm  = trim($request->dm  ?? '');

        try {
            $apiUrl   = env('VITE_WARRANTY_SN_API_GETDATA');
            $response = Http::timeout(15)->get($apiUrl, ['search' => $sku]);
            $data     = $response->json();

            if (($data['status'] ?? '') !== 'SUCCESS') {
                return response()->json(['sp' => []]);
            }

            $pid    = $data['skumain'] ?? $sku;
            $spAll  = $data['sp']      ?? [];

            $dmData = ($dm && isset($spAll[$pid][$dm]))
                ? [$dm => $spAll[$pid][$dm]]
                : ($spAll[$pid] ?? []);

            $spMap = [];
            foreach ($dmData as $dmKey => $spItems) {
                foreach ($spItems as $sp) {
                    $spcode = $sp['spcode'] ?? null;
                    if (!$spcode) continue;
                    if (isset($spMap[$spcode])) continue;

                    // บังคับใช้ราคา disc40p สำหรับร้านที่ไม่ใช่ศูนย์ซ่อม
                    $price = floatval($sp['disc40p'] ?? $sp['disc40p20p'] ?? $sp['disc20p'] ?? 0);

                    $spMap[$spcode] = [
                        'price_per_unit'    => $price,
                        'stdprice_per_unit' => floatval($sp['stdprice'] ?? 0),
                        'spunit'            => $sp['spunit'] ?? 'ชิ้น',
                    ];
                }
            }

            $cartItems = Cart::query()
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('is_active', false)
                ->whereIn('sp_code', array_keys($spMap))
                ->get()
                ->keyBy('sp_code');

            foreach ($spMap as $spcode => &$spData) {
                $cart = $cartItems->get($spcode);
                $spData['cart_added'] = (bool) $cart;
                $spData['cart_id']    = $cart?->id;
                $spData['cart_qty']   = $cart?->qty ?? 0;
            }

            return response()->json(['sp' => $spMap]);
        } catch (\Exception $e) {
            return response()->json(['sp' => [], 'error' => $e->getMessage()]);
        }
    }

    public function cartListJson(): JsonResponse
    {
        $sku_image_path = env('VITE_IMAGE_PID');
        $groupSku = Cart::query()
            ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
            ->where('is_active', false)
            ->select('sku_code', 'sku_name')
            ->groupBy('sku_code', 'sku_name')
            ->get();

        $apiUrl = env('VITE_WARRANTY_SN_API_GETDATA');
        $spPriceMap = [];

        $uniqueSkus = $groupSku->pluck('sku_code')->unique();
        foreach ($uniqueSkus as $skuCode) {
            try {
                $response = Http::timeout(10)->get($apiUrl, ['search' => $skuCode]);
                if (!$response->successful()) continue;

                $data = $response->json();
                if (($data['status'] ?? '') !== 'SUCCESS') continue;

                $spAll = $data['sp'] ?? [];
                $pid = $data['skumain'] ?? $skuCode;

                if (!empty($spAll[$pid])) {
                    foreach ($spAll[$pid] as $dmKey => $dmParts) {
                        foreach ($dmParts as $sp) {
                            $spcode = $sp['spcode'] ?? null;
                            if (!$spcode) continue;

                            // บังคับใช้ราคา disc40p
                            $spPriceMap[$spcode] = floatval($sp['disc40p'] ?? $sp['disc40p20p'] ?? $sp['disc20p'] ?? 0);
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning("Dealer cart reprice: ไม่สามารถดึงราคาสำหรับ SKU {$skuCode}", ['error' => $e->getMessage()]);
                continue;
            }
        }

        $totalSp = 0;
        $totalPrice = 0;
        foreach ($groupSku as $group) {
            $group['sku_image_path'] = $sku_image_path . $group['sku_code'] . ".jpg";
            $group['list'] = Cart::query()
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('is_active', false)
                ->where('sku_code', $group->sku_code)
                ->where('sku_name', $group->sku_name)
                ->get();

            foreach ($group['list'] as $cartItem) {
                if (isset($spPriceMap[$cartItem->sp_code])) {
                    $newPrice = $spPriceMap[$cartItem->sp_code];
                    if (floatval($cartItem->price_per_unit) !== $newPrice) {
                        $cartItem->update(['price_per_unit' => $newPrice]);
                        $cartItem->price_per_unit = $newPrice;
                    }
                }
            }

            $totalSp += $group['list']->count();
            foreach ($group['list'] as $item) {
                $totalPrice += floatval($item->price_per_unit) * floatval($item->qty);
            }
        }

        return response()->json([
            'groups'     => $groupSku,
            'totalSp'    => $totalSp,
            'totalPrice' => $totalPrice,
        ]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        try {
            if (!$request->has('groups') || empty($request->groups)) {
                return response()->json(['status' => 'error', 'message' => 'ไม่พบข้อมูลสินค้าในตะกร้า'], 400);
            }
            $groups   = $request->groups;
            $address  = $request->address;
            $phone    = $request->phone;
            $order_id = 'ORDER-' . time() . rand(1000, 9999);

            DB::beginTransaction();

            $order = Order::query()->create([
                'order_id'   => $order_id,
                'is_code_key' => Auth::user()->is_code_cust_id,
                'user_key'   => Auth::user()->user_code,
                'buy_at'     => Carbon::now(),
                'status'     => 'pending',
                'phone'      => $phone,
                'address'    => $address ?? Auth::user()->store_info->address,
            ]);

            $totalOrderPrice = 0;
            $items = [];
            foreach ($groups as $group) {
                if (!isset($group['list']) || empty($group['list'])) continue;
                foreach ($group['list'] as $spItem) {
                    $items[] = "{$spItem['sp_code']}*{$spItem['qty']}";
                    if (!isset($spItem['id'])) continue;
                    try {
                        $sp = Cart::query()->findOrFail($spItem['id']);
                        $sp->update(['is_active' => true]);
                        $qty           = $spItem['qty'] ?? 1;
                        $pricePerUnit  = $spItem['price_per_unit'] ?? 0;
                        $totalOrderPrice += $qty * $pricePerUnit;
                        $skuCode = $group['sku_code'] ?? $sp['sku_code'];
                        OrderSpList::query()->create([
                            'order_id'       => $order_id,
                            'sp_code'        => $sp['sp_code'],
                            'sp_name'        => $sp['sp_name'],
                            'sku_code'       => $skuCode,
                            'qty'            => $qty,
                            'price_per_unit' => $pricePerUnit,
                            'sp_unit'        => $sp['sp_unit'] ?? 'ชิ้น',
                            'path_file'      => env('VITE_IMAGE_SP_NEW') . $skuCode . "/" . $sp['sp_code'] . ".jpg",
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Dealer order item error: ' . $e->getMessage(), ['item_id' => $spItem['id'] ?? 'unknown', 'order_id' => $order_id]);
                    }
                }
            }

            $receive_id = StoreInformation::query()
                ->leftJoin('sale_information', 'sale_information.sale_code', '=', 'store_information.sale_id')
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->select('sale_information.lark_token')
                ->first();

            $order->update(['total_price' => $totalOrderPrice]);

            $text = "ร้านค้า : " . Auth::user()->store_info->shop_name
                . "\nรหัสออเดอร์ : $order_id"
                . "\nแจ้งเรื่อง : สั่งซื้ออะไหล่\nรายการ :\n\n" . implode("\n", $items);

            $body = [
                "receive_id" => $receive_id?->lark_token ?? 'unknown',
                "msg_type"   => "text",
                "content"    => json_encode(["text" => $text], JSON_UNESCAPED_UNICODE),
            ];

            $tokenRes = Http::post('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', [
                'app_id'     => env('VITE_LARK_APP_ID'),
                'app_secret' => env('VITE_LARK_APP_SECRET'),
            ]);

            if ($tokenRes->successful() && ($tokenRes->json()['code'] ?? -1) !== 10014) {
                $sendRes = Http::withHeaders(['Authorization' => 'Bearer ' . $tokenRes->json()['tenant_access_token']])
                    ->post('https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=open_id', $body);
                if (!$sendRes->successful()) {
                    $message = 'สร้างคำสั่งซื้อเรียบร้อยแล้ว แต่ ไม่สามารถส่งการแจ้งเตือนไปหาเซลล์ได้';
                    $order->update(['status_send_order' => false]);
                }
            } else {
                $message = 'สร้างคำสั่งซื้อเรียบร้อยแล้ว แต่ ไม่สามารถส่งการแจ้งเตือนไปหาเซลล์ได้';
                $order->update(['status_send_order' => false]);
            }

            DB::commit();
            return response()->json([
                'status'  => 'success',
                'message' => $message ?? 'สร้างคำสั่งซื้อเรียบร้อยแล้ว',
                'order'   => ['order_id' => $order_id, 'total_price' => $totalOrderPrice, 'buy_at' => $order->buy_at],
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Dealer order creation failed: ' . $e->getMessage(), ['user_id' => Auth::id()]);
            return response()->json(['status' => 'error', 'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()], 500);
        }
    }

    public function history(): Response
    {
        $history = Order::query()
            ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->orderBy('id', 'desc')
            ->paginate(100);
        return Inertia::render('DealerPage/Orders/DealerOrderHistory', ['history' => $history]);
    }

    public function historyDetail($order_id): Response|RedirectResponse
    {
        $order = Order::query()
            ->where('order_id', $order_id)
            ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->first();

        if (!$order) return redirect()->route('dealerRepair.orders.history');

        $listSp = OrderSpList::query()->where('order_id', $order_id)->get();
        $totalPrice = $listSp->sum(fn($sp) => $sp->price_per_unit * $sp->qty);
        $order['totalPrice'] = round($totalPrice, 2);

        return Inertia::render('DealerPage/Orders/DealerOrderHistoryDetail', [
            'order'  => $order,
            'listSp' => $listSp,
        ]);
    }
}
