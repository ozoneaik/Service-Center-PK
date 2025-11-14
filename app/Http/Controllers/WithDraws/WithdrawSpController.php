<?php

namespace App\Http\Controllers\WithDraws;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\StoreInformation;
use App\Models\WithdrawCart;
use App\Models\WithdrawOrder;
use App\Models\WithdrawOrderSpList;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class WithdrawSpController extends Controller
{
    public function index(Request $request): Response
    {
        if ($request->restore == 1) {
            return Inertia::render('Admin/WithdrawSp/Index', [
                'pageTitle' => 'เบิกอะไหล่สินค้า',
                'message'   => null,
                'sku'       => null,
                'result'    => null,
                'restore'   => 1, 
            ]);
        }

        $sku = $request->query('sku');

        if (!empty($sku)) {
            return $this->search($sku);
        }

        return Inertia::render('Admin/WithdrawSp/Index', [
            'pageTitle' => 'เบิกอะไหล่สินค้า',
            'message'   => null,
            'sku'       => null,
            'result'    => null,
            'restore'   => 0,
        ]);
    }

    public function cartCount(): JsonResponse
    {
        try {
            $count = WithdrawCart::query()
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->where('is_active', false)
                ->count();

            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            return response()->json(['count' => 0]);
        }
    }

    //13/11/2568
    public function search(string $sku): Response
    {
        $apiUrl = env('VITE_WARRANTY_SN_API_GETDATA');
        $message = '';
        $result = [];
        $diagramLayers = [];
        $modelOptions = [];
        $spList = [];

        try {
            $response = Http::timeout(15)->get($apiUrl, ['search' => $sku]);
            if (!$response->successful()) {
                throw new \Exception('API สินค้าหลักไม่ตอบกลับ');
            }

            $data = $response->json();
            if (($data['status'] ?? '') !== 'SUCCESS') {
                throw new \Exception($data['message'] ?? 'ไม่พบข้อมูลสินค้าในระบบ');
            }

            $assets = $data['assets'] ?? [];
            $dmList = $data['dm_list'] ?? [];
            $spAll = $data['sp'] ?? [];
            $pid = $sku;
            $asset = $assets[$pid] ?? [];
            $facmodel = $asset['facmodel'] ?? $pid;

            $imageDmBase = rtrim(env('VITE_IMAGE_DM', 'https://warranty-sn.pumpkin.tools/storage'), '/');
            $imageSpBase = rtrim(env('VITE_IMAGE_SP', ''), '/');

            // loop dm list
            if (!empty($dmList[$pid])) {
                foreach ($dmList[$pid] as $dmKey => $dmData) {
                    // $dmName = strtoupper("DM{$dmKey}");
                    // $modelOptions[] = $dmName; // เพิ่มชื่อ DM ใน dropdown

                    // $modelfg = $dmData['modelfg'] ?? $facmodel;

                    $modelfg = trim($dmData['modelfg'] ?? $facmodel);
                    if ($modelfg == '') {
                        $modelfg = "DM" . str_pad($dmKey, 2, "0", STR_PAD_LEFT);
                    }
                    $modelOptions[] = $modelfg;

                    // Diagram
                    for ($i = 1; $i <= 5; $i++) {
                        $imgKey = "img_{$i}";
                        $imgUrl = $dmData[$imgKey] ?? null;
                        if (!$imgUrl) continue;

                        if (!str_contains($imgUrl, 'http')) {
                            $imgUrl = "{$imageDmBase}/" . ltrim($imgUrl, '/');
                        }

                        $diagramLayers[] = [
                            'modelfg' => $modelfg,
                            'layer' => "รูปที่ {$i}",
                            'path_file' => $imgUrl,
                            'layout' => $i,
                            'typedm' => $dmKey,
                        ];
                    }

                    // Spare Parts ตาม DM
                    if (!empty($spAll[$pid][$dmKey])) {
                        foreach ($spAll[$pid][$dmKey] as $sp) {
                            $spcode = $sp['spcode'] ?? null;
                            if (!$spcode) continue;

                            $spList[] = [
                                'spcode' => $spcode,
                                'spname' => $sp['spname'] ?? '',
                                'spunit' => $sp['spunit'] ?? 'ชิ้น',
                                'stdprice_per_unit' => floatval($sp['stdprice'] ?? 0),
                                'price_per_unit' => floatval($sp['disc40p20p'] ?? $sp['disc40p'] ?? $sp['disc20p'] ?? 0),
                                'layout' => (int)($sp['layout'] ?? 1),
                                'tracking_number' => $sp['tracking_number'] ?? '',
                                'modelfg' => $modelfg,
                                'pid' => $pid,
                                'skufg' => $pid,
                                'pname' => $asset['pname'] ?? '',
                                'imagesku' => $asset['imagesku'][0] ?? null,
                                'typedm' => $dmKey,
                            ];
                        }
                    }
                }
            }

            // เติม stock / cart
            foreach ($spList as $i => $sp) {
                $spcode = $sp['spcode'];
                $spList[$i]['path_file'] = "{$imageSpBase}/{$spcode}.jpg";

                $stockQty = DB::table('stock_spare_parts')
                    ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                    ->where('sp_code', $spcode)
                    ->value('qty_sp') ?? 0;

                $spList[$i]['stock_balance'] = (int)$stockQty;

                $cart = WithdrawCart::query()
                    ->where('sp_code', $spcode)
                    ->where('is_active', false)
                    ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                    ->where('user_code_key', Auth::user()->user_code)
                    ->first();

                $spList[$i]['added'] = (bool)$cart;
                $spList[$i]['remark'] = 'มาจากการเบิก';
            }

            $result = [
                'pid' => $sku,
                'pname' => $asset['pname'] ?? '',
                'pbaseunit' => $asset['pbaseunit'] ?? '',
                'facmodel' => $facmodel,
                'imagesku' => $asset['imagesku'][0] ?? null,
                'sp' => $spList,
                'model_options' => array_values(array_unique($modelOptions)),
                'diagram_layers' => $diagramLayers,
            ];
        } catch (\Exception $e) {
            $message = $e->getMessage();
            $result = null;
        }

        Log::debug('✅ WithdrawSp Search (DM filter ready)', [
            'sku' => $sku,
            'count_sp' => count($result['sp'] ?? []),
            'models' => $result['model_options'] ?? [],
        ]);

        return Inertia::render('Admin/WithdrawSp/Index', [
            'pageTitle' => 'เบิกอะไหล่สินค้า',
            'message' => $message ?: null,
            'sku' => $sku,
            'result' => $result,
        ]);
    }

    public function carts(): Response
    {
        $skuImageBase = env('VITE_IMAGE_PID');

        $groupSku = WithdrawCart::query()
            ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
            ->where('user_code_key', Auth::user()->user_code)
            ->where('is_active', false)
            ->where('remark', 'มาจากการเบิก')
            ->select('sku_code', 'sku_name')
            ->groupBy('sku_code', 'sku_name')
            ->get();

        $totalSp = 0;
        foreach ($groupSku as $group) {
            $group['sku_image_path'] = $skuImageBase . $group['sku_code'] . ".jpg";
            $group['list'] = WithdrawCart::query()
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->where('is_active', false)
                ->where('remark', 'มาจากการเบิก')
                ->where('sku_code', $group->sku_code)
                ->get();

            $totalSp += $group['list']->count();
        }

        return Inertia::render('Admin/WithdrawSp/CartList', [
            'groupSku' => $groupSku,
            'totalSp' => $totalSp,
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }

    public function addToCart(Request $request): JsonResponse
    {
        try {
            // ตรวจว่ามีของในสต็อกหรือไม่
            $stockQty = DB::table('stock_spare_parts')
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('sp_code', $request->spcode)
                ->value('qty_sp') ?? 0;

            // if ($stockQty <= 0) {
            //     return response()->json([
            //         'message' => 'out_of_stock',
            //         'error'   => 'สินค้าไม่มีสต็อกคงเหลือ',
            //     ], 200);
            // }

            // ป้องกันซ้ำ
            if (WithdrawCart::existsInCart(Auth::user()->user_code, $request->spcode)) {
                return response()->json(['message' => 'already_added'], 200);
            }

            // สร้างข้อมูลใหม่
            $cart = WithdrawCart::query()->create([
                'is_code_cust_id' => Auth::user()->is_code_cust_id,
                'user_code_key'   => Auth::user()->user_code,
                'sku_code'        => $request->skufg,
                'sku_name'        => $request->pname,
                'sp_code'         => $request->spcode,
                'sp_name'         => $request->spname,
                'price_per_unit'  => floatval($request->price_per_unit),
                'stdprice_per_unit' => floatval($request->stdprice_per_unit ?? $request->std_price ?? 0),
                'sp_unit'         => $request->spunit,
                'qty'             => 1,
                'remark'          => 'มาจากการเบิก',
            ]);

            return response()->json(['message' => 'success', 'cart' => $cart]);
        } catch (\Illuminate\Database\QueryException $e) {
            if (str_contains($e->getMessage(), 'uq_withdraw_carts_user_sp_active_false')) {
                return response()->json(['message' => 'already_added'], 200);
            }
            return response()->json(['message' => 'Error occurred', 'error' => $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error occurred', 'error' => $e->getMessage()], 500);
        }
    }

    public function qty(Request $request, string $condition = 'add'): JsonResponse
    {
        try {
            $sp = WithdrawCart::query()->where('id', $request->id)
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->where('is_active', false)
                ->where('remark', 'มาจากการเบิก')
                ->firstOrFail();

            if ($condition === 'add') {
                $sp->update(['qty' => $sp->qty + 1]);
            } else {
                if ($sp->qty <= 1) {
                    return response()->json(['message' => 'Cannot reduce quantity below 1'], 400);
                }
                $sp->update(['qty' => $sp->qty - 1]);
            }
            return response()->json(['message' => 'success', 'sp' => $sp->fresh()]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error occurred', 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteCart(int $id): JsonResponse
    {
        try {
            $sp = WithdrawCart::query()->where('id', $id)
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->where('is_active', false)
                ->where('remark', 'มาจากการเบิก')
                ->firstOrFail();

            $sp->delete();

            return response()->json(['message' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error occurred', 'error' => $e->getMessage()], 500);
        }
    }

    // public function createOrder(Request $request): JsonResponse
    // {
    //     try {
    //         if (!$request->has('groups') || empty($request->groups)) {
    //             return response()->json([
    //                 'status' => 'error',
    //                 'message' => 'ไม่พบข้อมูลสินค้าในตะกร้าเบิก'
    //             ], 400);
    //         }

    //         $groups = $request->groups;
    //         $remark = $request->remark ?? 'เบิกอะไหล่จากระบบ';
    //         $withdraw_id = 'WITHDRAW-' . time() . rand(1000, 9999);
    //         $phone = $request->phone;
    //         DB::beginTransaction();

    //         $order = WithdrawOrder::create([
    //             'withdraw_id' => $withdraw_id,
    //             'is_code_key' => Auth::user()->is_code_cust_id,
    //             'user_key'    => Auth::user()->user_code,
    //             'pay_at'      => Carbon::now(),
    //             'status'      => 'pending',
    //             'phone'       => $phone,
    //             'remark'      => $remark,
    //             'address' => $request->address ?? Auth::user()->store_info->address,
    //         ]);

    //         $totalPrice = 0;
    //         $items = [];

    //         foreach ($groups as $group) {
    //             if (empty($group['list'])) continue;

    //             foreach ($group['list'] as $spItem) {
    //                 $sp = WithdrawCart::query()
    //                     ->where('id', $spItem['id'])
    //                     ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
    //                     ->where('is_active', false)
    //                     ->first();

    //                 if (!$sp) continue;

    //                 // Mark ว่าใช้งานแล้ว
    //                 $sp->update(['is_active' => true]);

    //                 $qty = $spItem['qty'] ?? 1;
    //                 $price = $spItem['price_per_unit'] ?? 0;
    //                 $lineTotal = $qty * $price;
    //                 $totalPrice += $lineTotal;

    //                 WithdrawOrderSpList::create([
    //                     'withdraw_id'    => $withdraw_id,
    //                     'sp_code'        => $sp->sp_code,
    //                     'sp_name'        => $sp->sp_name,
    //                     'sku_code'       => $sp->sku_code,
    //                     'qty'            => $qty,
    //                     'price_per_unit' => $price,
    //                     'sp_unit'        => $sp->sp_unit ?? 'ชิ้น',
    //                     'path_file'      => env('VITE_IMAGE_SP') . ($sp->sku_code ?? '') . '/' . $sp->sp_code . '.jpg',
    //                 ]);

    //                 $items[] = "{$sp->sp_code} * {$qty}";
    //             }
    //         }

    //         $order->update(['total_price' => $totalPrice]);

    //         $receive_id = StoreInformation::query()
    //             ->leftJoin('sale_information', 'sale_information.sale_code', '=', 'store_information.sale_id')
    //             ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
    //             ->select('sale_information.lark_token')
    //             ->first();

    //         $text_withdraw_id = "รหัสใบเบิก : $withdraw_id";
    //         $text = "ศูนย์ซ่อม : " . (Auth::user()->store_info->shop_name ?? 'ไม่ทราบชื่อร้าน') .
    //             "\n$text_withdraw_id" .
    //             "\nแจ้งเรื่อง : เบิกอะไหล่\nรายการ:\n" . implode("\n", $items);

    //         $body = [
    //             "receive_id" => $receive_id?->lark_token ?? 'unknown',
    //             "msg_type"   => "text",
    //             "content"    => json_encode(["text" => $text], JSON_UNESCAPED_UNICODE),
    //         ];

    //         $response = Http::post('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', [
    //             'app_id'     => env('VITE_LARK_APP_ID'),
    //             'app_secret' => env('VITE_LARK_APP_SECRET'),
    //         ]);

    //         if ($response->successful()) {
    //             $token = $response->json('tenant_access_token');
    //             Http::withHeaders(['Authorization' => 'Bearer ' . $token])
    //                 ->post('https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=open_id', $body);
    //         }

    //         DB::commit();

    //         return response()->json([
    //             'status'  => 'success',
    //             'message' => 'สร้างใบเบิกอะไหล่เรียบร้อยแล้ว',
    //             'order'   => [
    //                 'withdraw_id' => $withdraw_id,
    //                 'total_price' => $totalPrice,
    //                 'created_at'  => $order->created_at,
    //             ],
    //         ], 200);
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         Log::error('❌ Withdraw order creation failed', [
    //             'user' => Auth::id(),
    //             'error' => $e->getMessage(),
    //         ]);
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => $e->getMessage(),
    //         ], 500);
    //     }
    // }

    public function cartSpcodes(): JsonResponse
    {
        try {
            $spcodes = WithdrawCart::query()
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->where('is_active', false)
                ->pluck('sp_code')
                ->toArray();

            return response()->json(['spcodes' => $spcodes]);
        } catch (\Exception $e) {
            return response()->json(['spcodes' => []]);
        }
    }

    public function history(): Response
    {
        $history = WithdrawOrder::query()
            ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->orderBy('id', 'desc')->paginate(100);
        return Inertia::render(
            'Admin/WithdrawSp/OrderWithdrawHistory',
            ['history' => $history]
        );
    }

    public function summary(): Response
    {
        $skuImageBase = env('VITE_IMAGE_PID');

        $groupSku = WithdrawCart::query()
            ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
            ->where('user_code_key', Auth::user()->user_code)
            ->where('is_active', false)
            ->where('remark', 'มาจากการเบิก')
            ->select('sku_code', 'sku_name')
            ->groupBy('sku_code', 'sku_name')
            ->get();

        $totalSp = 0;

        foreach ($groupSku as $group) {
            $group['sku_image_path'] = $skuImageBase . $group['sku_code'] . ".jpg";

            $list = WithdrawCart::query()
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->where('is_active', false)
                ->where('remark', 'มาจากการเบิก')
                ->where('sku_code', $group->sku_code)
                ->get();

            foreach ($list as $item) {
                $stockQty = DB::table('stock_spare_parts')
                    ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                    ->where('sp_code', $item->sp_code)
                    ->value('qty_sp') ?? 0;

                $item->stock_balance = (int) $stockQty;
            }

            $group['list'] = $list;
            $totalSp += $list->count();
        }

        return Inertia::render('Admin/WithdrawSp/WithdrawSummary', [
            'groupSku' => $groupSku,
            'totalSp' => $totalSp,
            'is_code_cust_id' => Auth::user()->is_code_cust_id,
        ]);
    }
}
