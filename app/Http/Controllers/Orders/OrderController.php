<?php

namespace App\Http\Controllers\Orders;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderRequest;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderSpList;
use App\Models\StoreInformation;
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
    public function index(Request $request): Response
    {
        $sku = $request->sku ?? null;

        if (isset($sku)) {
            return $this->search($sku);
        }
        return Inertia::render('Orders/OrderList', [
            'message' => null,
            'sku' => null,
            'result' => null,
        ]);
    }

    // public function search($sku)
    // {
    //     $Api = env('VITE_API_ORDER');
    //     $DiagramApi = env('VITE_API_DIAGRAM_NEW_TWO');

    //     $message = '';
    //     $result = [];
    //     $status = 500;

    //     try {
    //         $response = Http::post($Api, ['pid' => $sku, 'views' => 'single']);
    //         if (!$response->successful()) throw new \Exception('API สินค้าหลักไม่ตอบกลับ');

    //         $data = $response->json();
    //         if (($data['status'] ?? '') !== 'SUCCESS') throw new \Exception('ไม่พบรหัสสินค้านี้');

    //         $result = $data['assets'][0] ?? [];
    //         $status = 200;

    //         $diagramRes = Http::post($DiagramApi, [
    //             'pid'   => $sku,
    //             'layout' => 'single'
    //         ]);

    //         $diagramLayers = [];      // [{modelfg, layer, path_file}]
    //         $diagramMap = [];         // spcode => ['modelfg' => '...', 'tracking' => ..., 'layout' => ...]
    //         $modelOptions = [];       // unique list of modelfg

    //         if ($diagramRes->successful()) {
    //             $diagramData = $diagramRes->json();

    //             if (is_array($diagramData)) {
    //                 foreach ($diagramData as $dm) {
    //                     $model = $dm['modelfg'] ?? ($result['facmodel'] ?? null);

    //                     // เก็บรายการรูปภาพตามโมเดล
    //                     // if (isset($dm['image']) && is_array($dm['image'])) {
    //                     //     foreach ($dm['image'] as $index => $img) {
    //                     //         $diagramLayers[] = [
    //                     //             'modelfg'   => $model,
    //                     //             'layer'     => 'รูปที่ ' . ($index + 1),
    //                     //             'path_file' => $img['path_file'] ?? null,
    //                     //         ];
    //                     //     }
    //                     // }
    //                     if (isset($dm['image']) && is_array($dm['image'])) {
    //                         foreach ($dm['image'] as $index => $img) {
    //                             // หา layout ของรูป
    //                             $layerChar = null;
    //                             if (!empty($img['layout'])) {
    //                                 $layerChar = strtolower($img['layout']);
    //                             } elseif (!empty($img['namefile_dm']) && str_contains(strtolower($img['namefile_dm']), 'inside')) {
    //                                 $layerChar = 'inside';
    //                             } else {
    //                                 // fallback: รูปแรก outside, รูปถัดไป inside
    //                                 $layerChar = $index === 0 ? 'outside' : 'inside';
    //                             }

    //                             $diagramLayers[] = [
    //                                 'modelfg'    => $model,
    //                                 'layer'      => 'รูปที่ ' . ($index + 1),
    //                                 'path_file'  => $img['path_file'] ?? null,
    //                                 'layer_char' => $layerChar,
    //                                 // 'typedm'   => $dm['typedm'] ?? 'DM01', // ถ้าอยากส่งไปด้วยก็ได้
    //                             ];
    //                         }
    //                     }

    //                     if (isset($dm['list']) && is_array($dm['list'])) {
    //                         foreach ($dm['list'] as $item) {
    //                             $sp = $item['skusp'] ?? null;
    //                             if (!$sp) continue;

    //                             $diagramMap[$sp] = [
    //                                 'modelfg' => $item['modelfg'] ?? $model,
    //                                 'tracking' => $item['tracking_number'] ?? null,
    //                                 'layout'   => $item['layout'] ?? 'outside',
    //                             ];
    //                             if (!empty($diagramMap[$sp]['modelfg'])) {
    //                                 $modelOptions[] = $diagramMap[$sp]['modelfg'];
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         } else {
    //             Log::warning("⚠️ Diagram API failed", ['status' => $diagramRes->status()]);
    //         }

    //         $modelOptions = array_values(array_unique(array_filter($modelOptions)));
    //         foreach ($result['sp'] as $key => $item) {
    //             $spcode = $item['spcode'] ?? null;
    //             $result['sp'][$key]['skufg']     = $sku;
    //             $result['sp'][$key]['pname']     = $result['pname'] ?? '';
    //             $result['sp'][$key]['imagesku']  = $result['imagesku'] ?? '';
    //             $result['sp'][$key]['path_file'] = env('VITE_IMAGE_SP') . $spcode . ".jpg";

    //             if ($spcode && isset($diagramMap[$spcode])) {
    //                 $result['sp'][$key]['modelfg']         = $diagramMap[$spcode]['modelfg'] ?? ($result['facmodel'] ?? null);
    //                 $result['sp'][$key]['tracking_number'] = $diagramMap[$spcode]['tracking'] ?? null;
    //                 $result['sp'][$key]['layout']          = $diagramMap[$spcode]['layout'] ?? 'outside';
    //             } else {
    //                 $result['sp'][$key]['modelfg']         = $result['facmodel'] ?? null;
    //                 $result['sp'][$key]['tracking_number'] = null;
    //                 $result['sp'][$key]['layout']          = 'outside';
    //             }

    //             // ติดสถานะในตะกร้า
    //             $Carts = Cart::query()
    //                 ->where('sp_code', $spcode)
    //                 ->where('is_active', false)
    //                 ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
    //                 ->first();
    //             $result['sp'][$key]['added']  = (bool) $Carts;
    //             $result['sp'][$key]['remark'] = 'มาจากการสั่งซื้อ';
    //         }

    //         $result['model_options']  = $modelOptions;
    //         $result['diagram_layers'] = $diagramLayers;
    //     } catch (\Exception $e) {
    //         $message = $e->getMessage();
    //         $status  = 400;
    //     }

    //     return Inertia::render('Orders/OrderList', [
    //         'message' => $message,
    //         'sku'     => $sku,
    //         'result'  => $result,
    //     ]);
    // }

    //เก่า
    // public function search(string $sku): Response
    // {
    //     $apiUrl = env('VITE_WARRANTY_SN_API_GETDATA');
    //     $message = '';
    //     $result = [];
    //     $diagramLayers = [];
    //     $modelOptions = [];
    //     $spList = [];

    //     try {
    //         $response = Http::timeout(15)->get($apiUrl, ['search' => $sku]);
    //         if (!$response->successful()) {
    //             throw new \Exception('API สินค้าหลักไม่ตอบกลับ');
    //         }

    //         $data = $response->json();
    //         if (($data['status'] ?? '') !== 'SUCCESS') {
    //             throw new \Exception($data['message'] ?? 'ไม่พบข้อมูลสินค้าในระบบ');
    //         }

    //         $assets   = $data['assets'] ?? [];
    //         $dmList   = $data['dm_list'] ?? [];
    //         $spAll    = $data['sp'] ?? [];
    //         $skus     = $data['skuset'] ?? [$sku]; // เผื่อกรณี single model

    //         // loop สินค้าทุกตัวใน combo
    //         foreach ($skus as $pid) {
    //             $asset = $assets[$pid] ?? [];
    //             $facmodel = $asset['facmodel'] ?? $pid;
    //             $modelOptions[] = $facmodel;

    //             $layoutMap = []; // เช่น ['A' => ['img_1' => 1, 'img_2' => 2]]
    //             if (!empty($dmList[$pid])) {
    //                 foreach ($dmList[$pid] as $dmKey => $dmData) {
    //                     for ($i = 1; $i <= 5; $i++) {
    //                         $imgKey = "img_{$i}";
    //                         $imgUrl = $dmData[$imgKey] ?? null;
    //                         if (!empty($imgUrl)) {
    //                             if (!str_contains($imgUrl, 'http')) {
    //                                 $imgUrl = rtrim(env('VITE_IMAGE_DM', 'https://warranty-sn.pumpkin.tools/storage'), '/') . '/' . ltrim($imgUrl, '/');
    //                             }
    //                             $diagramLayers[] = [
    //                                 'modelfg'    => $facmodel,
    //                                 'layer'      => "รูปที่ {$i}",
    //                                 'path_file'  => $imgUrl,
    //                                 'layout'     => $i,
    //                                 'typedm'     => $dmKey,
    //                             ];
    //                             $layoutMap[$dmKey][$imgKey] = $i;
    //                         }
    //                     }
    //                 }
    //             }

    //             if (!empty($spAll[$pid]) && is_array($spAll[$pid])) {
    //                 foreach ($spAll[$pid] as $dmKey => $spItems) {
    //                     $layoutIndex = 1; 
    //                     if (isset($layoutMap[$dmKey])) {
    //                         $layoutIndex = count($layoutMap[$dmKey]);
    //                     }

    //                     foreach ($spItems as $sp) {
    //                         $spcode = $sp['spcode'] ?? null;
    //                         if (!$spcode) continue;

    //                         $layout = $sp['layout'] ?? $layoutIndex;

    //                         $spList[] = [
    //                             'spcode'            => $spcode,
    //                             'spname'            => $sp['spname'] ?? '',
    //                             'spunit'            => $sp['spunit'] ?? 'ชิ้น',
    //                             'stdprice_per_unit' => floatval($sp['stdprice'] ?? 0),
    //                             'price_per_unit'    => floatval($sp['disc40p20p'] ?? $sp['disc40p'] ?? $sp['disc20p'] ?? 0),
    //                             'layout'            => (int) $layout, // 🔹 ผูกเลข layout ตรงตามรูป img_x
    //                             'tracking_number'   => $sp['tracking_number'] ?? '',
    //                             'modelfg'           => $facmodel,
    //                             'pid'               => $pid,
    //                             'skufg'             => $pid,
    //                             'pname'             => $asset['pname'] ?? '',
    //                             'imagesku'          => $asset['imagesku'][0] ?? null,
    //                         ];
    //                     }
    //                 }
    //             }
    //         }

    //         $imageBase = env('VITE_IMAGE_SP');
    //         foreach ($spList as $i => $sp) {
    //             $spcode = $sp['spcode'];
    //             $spList[$i]['path_file'] = $imageBase . $spcode . '.jpg';

    //             $cart = Cart::query()
    //                 ->where('sp_code', $spcode)
    //                 ->where('is_active', false)
    //                 ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
    //                 ->first();

    //             $spList[$i]['added'] = (bool)$cart;
    //             $spList[$i]['remark'] = 'มาจากการสั่งซื้อ';
    //         }

    //         $firstAsset = reset($assets);
    //         $result = [
    //             'pid'            => $sku,
    //             'pname'          => $firstAsset['pname'] ?? '',
    //             'pbaseunit'      => $firstAsset['pbaseunit'] ?? '',
    //             'facmodel'       => $firstAsset['facmodel'] ?? '',
    //             'imagesku'       => $firstAsset['imagesku'][0] ?? null,
    //             'sp'             => $spList,
    //             'model_options'  => array_values(array_unique($modelOptions)),
    //             'diagram_layers' => $diagramLayers,
    //         ];
    //     } catch (\Exception $e) {
    //         $message = $e->getMessage();
    //         $result = null;
    //     }

    //     Log::debug('✅ Order Search (API unified)', [
    //         'sku' => $sku,
    //         'count_sp' => count($result['sp'] ?? []),
    //         'count_dm' => count($result['diagram_layers'] ?? []),
    //         'models' => $result['model_options'] ?? [],
    //     ]);

    //     return Inertia::render('Orders/OrderList', [
    //         'message' => $message ?: null,
    //         'sku'     => $sku,
    //         'result'  => $result,
    //     ]);
    // }

    //deploy
    // public function search(string $sku): Response
    // {
    //     $apiUrl = env('VITE_WARRANTY_SN_API_GETDATA');
    //     $message = '';
    //     $result = [];
    //     $diagramLayers = [];
    //     $modelOptions = [];
    //     $spList = [];

    //     try {
    //         $response = Http::timeout(15)->get($apiUrl, ['search' => $sku]);
    //         if (!$response->successful()) {
    //             throw new \Exception('API สินค้าหลักไม่ตอบกลับ');
    //         }

    //         $data = $response->json();
    //         if (($data['status'] ?? '') !== 'SUCCESS') {
    //             throw new \Exception($data['message'] ?? 'ไม่พบข้อมูลสินค้าในระบบ');
    //         }

    //         // ✅ ใช้เฉพาะข้อมูลของ SKU ที่ค้นหา
    //         $assets   = $data['assets'] ?? [];
    //         $dmList   = $data['dm_list'] ?? [];
    //         $spAll    = $data['sp'] ?? [];
    //         $pid      = $sku;

    //         $asset = $assets[$pid] ?? [];
    //         $facmodel = $asset['facmodel'] ?? $pid;
    //         $modelOptions[] = $facmodel;

    //         // 🔹 ดึงรูป Diagram เฉพาะของ SKU นั้นเอง
    //         if (!empty($dmList[$pid])) {
    //             foreach ($dmList[$pid] as $dmKey => $dmData) {
    //                 for ($i = 1; $i <= 5; $i++) {
    //                     $imgKey = "img_{$i}";
    //                     $imgUrl = $dmData[$imgKey] ?? null;
    //                     if (!empty($imgUrl)) {
    //                         if (!str_contains($imgUrl, 'http')) {
    //                             $imgUrl = rtrim(env('VITE_IMAGE_DM', 'https://warranty-sn.pumpkin.tools/storage'), '/') . '/' . ltrim($imgUrl, '/');
    //                         }
    //                         $diagramLayers[] = [
    //                             'modelfg'    => $facmodel,
    //                             'layer'      => "รูปที่ {$i}",
    //                             'path_file'  => $imgUrl,
    //                             'layout'     => $i,
    //                             'typedm'     => $dmKey,
    //                         ];
    //                     }
    //                 }
    //             }
    //         }

    //         // 🔹 Flatten spare parts เฉพาะของ SKU นั้นเอง
    //         if (!empty($spAll[$pid]) && is_array($spAll[$pid])) {
    //             foreach ($spAll[$pid] as $dmKey => $spItems) {
    //                 foreach ($spItems as $sp) {
    //                     $spcode = $sp['spcode'] ?? null;
    //                     if (!$spcode) continue;

    //                     $layout = (int)($sp['layout'] ?? 1);
    //                     $spList[] = [
    //                         'spcode'            => $spcode,
    //                         'spname'            => $sp['spname'] ?? '',
    //                         'spunit'            => $sp['spunit'] ?? 'ชิ้น',
    //                         'stdprice_per_unit' => floatval($sp['stdprice'] ?? 0),
    //                         'price_per_unit'    => floatval($sp['disc40p20p'] ?? $sp['disc40p'] ?? $sp['disc20p'] ?? 0),
    //                         'layout'            => $layout,
    //                         'tracking_number'   => $sp['tracking_number'] ?? '',
    //                         'modelfg'           => $facmodel,
    //                         'pid'               => $pid,
    //                         'skufg'             => $pid,
    //                         'pname'             => $asset['pname'] ?? '',
    //                         'imagesku'          => $asset['imagesku'][0] ?? null,
    //                     ];
    //                 }
    //             }
    //         }

    //         // 🔹 เติม stock/cart สถานะในตะกร้า
    //         $imageBase = env('VITE_IMAGE_SP');
    //         foreach ($spList as $i => $sp) {
    //             $spcode = $sp['spcode'];
    //             $spList[$i]['path_file'] = $imageBase . $spcode . '.jpg';

    //             $cart = Cart::query()
    //                 ->where('sp_code', $spcode)
    //                 ->where('is_active', false)
    //                 ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
    //                 ->first();

    //             $spList[$i]['added'] = (bool)$cart;
    //             $spList[$i]['remark'] = 'มาจากการสั่งซื้อ';
    //         }

    //         //  รวมข้อมูลสินค้าทั้งหมดสำหรับส่งกลับหน้า React
    //         $result = [
    //             'pid'            => $sku,
    //             'pname'          => $asset['pname'] ?? '',
    //             'pbaseunit'      => $asset['pbaseunit'] ?? '',
    //             'facmodel'       => $facmodel,
    //             'imagesku'       => $asset['imagesku'][0] ?? null,
    //             'sp'             => $spList,
    //             'model_options'  => array_values(array_unique($modelOptions)),
    //             'diagram_layers' => $diagramLayers,
    //         ];
    //     } catch (\Exception $e) {
    //         $message = $e->getMessage();
    //         $result = null;
    //     }

    //     Log::debug('✅ Order Search (Fixed SKU only)', [
    //         'sku' => $sku,
    //         'count_sp' => count($result['sp'] ?? []),
    //         'count_dm' => count($result['diagram_layers'] ?? []),
    //         'models' => $result['model_options'] ?? [],
    //     ]);

    //     return Inertia::render('Orders/OrderList', [
    //         'message' => $message ?: null,
    //         'sku'     => $sku,
    //         'result'  => $result,
    //     ]);
    // }

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
            // $modelOptions[] = $facmodel;

            $imageDmBase = rtrim(env('VITE_IMAGE_DM', 'https://warranty-sn.pumpkin.tools/storage'), '/');
            $imageSpBase = rtrim(env('VITE_IMAGE_SP', ''), '/');

            // loop ผ่าน dmList เช่น DM01, DM02
            if (!empty($dmList[$pid])) {
                foreach ($dmList[$pid] as $dmKey => $dmData) {
                    // เพิ่ม DM01 / DM02 เข้า modelOptions

                    // $modelfg = $dmData['modelfg'] ?? $facmodel;
                    $modelfg = trim($dmData['modelfg'] ?? $facmodel);
                    if ($modelfg == '') {
                        $modelfg = "DM" . str_pad($dmKey, 2, "0", STR_PAD_LEFT);
                    }
                    $modelOptions[] = $modelfg;

                    // $modelOptions[] = "DM{$dmKey}";

                    // loop รูป diagram
                    for ($i = 1; $i <= 5; $i++) {
                        $imgKey = "img_{$i}";
                        $imgUrl = $dmData[$imgKey] ?? null;
                        if (!$imgUrl) continue;

                        if (!str_contains($imgUrl, 'http')) {
                            $imgUrl = "{$imageDmBase}/" . ltrim($imgUrl, '/');
                        }

                        $diagramLayers[] = [
                            'modelfg'   => $modelfg,
                            'layer'     => "รูปที่ {$i}",
                            'path_file' => $imgUrl,
                            'layout'    => $i,
                            'typedm'    => $dmKey,
                        ];
                    }

                    // Flatten อะไหล่เฉพาะของ DM นี้
                    if (!empty($spAll[$pid][$dmKey])) {
                        foreach ($spAll[$pid][$dmKey] as $sp) {
                            $spcode = $sp['spcode'] ?? null;
                            if (!$spcode) continue;

                            $spList[] = [
                                'spcode'            => $spcode,
                                'spname'            => $sp['spname'] ?? '',
                                'spunit'            => $sp['spunit'] ?? 'ชิ้น',
                                'stdprice_per_unit' => floatval($sp['stdprice'] ?? 0),
                                'price_per_unit'    => floatval($sp['disc40p20p'] ?? $sp['disc40p'] ?? $sp['disc20p'] ?? 0),
                                'layout'            => (int)($sp['layout'] ?? 1),
                                'tracking_number'   => $sp['tracking_number'] ?? '',
                                'modelfg'           => $modelfg,
                                'pid'               => $pid,
                                'skufg'             => $pid,
                                'pname'             => $asset['pname'] ?? '',
                                'imagesku'          => $asset['imagesku'][0] ?? null,
                                'typedm'            => $dmKey, // ผูก DM สำหรับ React กรอง
                            ];
                        }
                    }
                }
            }

            // เติม stock/cart
            foreach ($spList as $i => $sp) {
                $spcode = $sp['spcode'];
                $spList[$i]['path_file'] = "{$imageSpBase}/{$spcode}.jpg";

                $cart = Cart::query()
                    ->where('sp_code', $spcode)
                    ->where('is_active', false)
                    ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                    ->first();

                $spList[$i]['added'] = (bool)$cart;
                $spList[$i]['remark'] = 'มาจากการสั่งซื้อ';
            }


            if (collect($modelOptions)->contains(fn($m) => str_starts_with($m, 'DM'))) {
                $modelOptions = collect($modelOptions)
                    ->filter(fn($m) => str_starts_with($m, 'DM'))
                    ->values()
                    ->toArray();
            } else {
                $modelOptions = array_values(array_unique($modelOptions));
            }

            $result = [
                'pid'            => $sku,
                'pname'          => $asset['pname'] ?? '',
                'pbaseunit'      => $asset['pbaseunit'] ?? '',
                'facmodel'       => $facmodel,
                'imagesku'       => $asset['imagesku'][0] ?? null,
                'sp'             => $spList,
                // 'model_options'  => array_values(array_unique($modelOptions)),
                'model_options'  => $modelOptions,
                'diagram_layers' => $diagramLayers,
            ];
        } catch (\Exception $e) {
            $message = $e->getMessage();
            $result = null;
        }

        Log::debug('✅ Order Search (with DM filter)', [
            'sku' => $sku,
            'count_sp' => count($result['sp'] ?? []),
            'count_dm' => count($result['diagram_layers'] ?? []),
            'models' => $result['model_options'] ?? [],
        ]);

        return Inertia::render('Orders/OrderList', [
            'message' => $message ?: null,
            'sku'     => $sku,
            'result'  => $result,
        ]);
    }

    public function history(): Response
    {
        $history = Order::query()
            ->where('is_code_key', Auth::user()->is_code_cust_id)
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

    public function orderSuccess($message): Response
    {
        return Inertia::render('Orders/OrderSuccess', ['message' => $message]);
    }

    public function cartList(): Response
    {
        $sku_image_path = env('VITE_IMAGE_PID');
        $groupSku = Cart::query()
            ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
            ->where('is_active', false)
            ->select('sku_code', 'sku_name')
            ->groupBy('sku_code', 'sku_name')
            ->get();

        $totalSp = 0;
        foreach ($groupSku as $group) {
            $group['sku_image_path'] = $sku_image_path . $group['sku_code'] . ".jpg";
            $group['list'] = Cart::query()
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('is_active', false)
                ->where('sku_code', $group->sku_code)
                ->get();
            $totalSp += $group['list']->count();
        }

        return Inertia::render('Orders/carts/CartList', [
            'groupSku' => $groupSku,
            'totalSp' => $totalSp,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
                'pdf_url' => session('pdf_url'),
            ]
        ]);
    }

    public function addCart(Request $request): JsonResponse
    {
        try {
            $cart = Cart::query()->create([
                'is_code_cust_id' => Auth::user()->is_code_cust_id,
                'user_code_key' => Auth::user()->user_code,
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
            $address = $request->address;
            $phone = $request->phone;
            $order_id = 'ORDER-' . time() . rand(1000, 9999);
            DB::beginTransaction();

            $order = Order::query()->create([
                'order_id' => $order_id,
                'is_code_key' => Auth::user()->is_code_cust_id,
                'user_key' => Auth::user()->user_code,
                'buy_at' => Carbon::now(),
                'status' => 'pending',
                'phone' => $phone,
                'address' => $request->address ?? Auth::user()->store_info->address,
            ]);
            $totalOrderPrice = 0;
            $items = [];
            foreach ($groups as $group) {
                if (!isset($group['list']) || empty($group['list'])) {
                    continue;
                }
                $spList = $group['list'];
                $totalSpCount = [];
                foreach ($spList as $spItem) {
                    $items[] = "{$spItem['sp_code']}*{$spItem['qty']}";
                    if (!isset($spItem['id'])) {
                        continue;
                    }
                    try {

                        $sp = Cart::query()->findOrFail($spItem['id']);
                        $sp->update(['is_active' => true]);
                        $qty = $spItem['qty'] ?? 1;
                        $pricePerUnit = $spItem['price_per_unit'] ?? 0;
                        $itemTotalPrice = $qty * $pricePerUnit;
                        $totalOrderPrice += $itemTotalPrice;
                        $skuCode = $group['sku_code'] ?? $sp['sku_code'];
                        $pathFile = env('VITE_IMAGE_SP') . $skuCode . "/" . $sp['sp_code'] . ".jpg";
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
                        Log::error('Error processing item: ' . $e->getMessage(), [
                            'item_id' => $spItem['id'] ?? 'unknown',
                            'order_id' => $order_id
                        ]);
                    }
                }
            }
            // ดึงรหัส sale id เพื่อส่งไปยัง lark ของเซลล์นั้นๆ
            $receive_id = StoreInformation::query()
                ->leftJoin('sale_information', 'sale_information.sale_code', '=', 'store_information.sale_id')
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->select('sale_information.lark_token')
                ->first();
            $order->update(['total_price' => $totalOrderPrice]);
            $text_order_id = "รหัสออเดอร์ : $order_id";
            $text = "ศูนย์ซ่อม : " . Auth::user()->store_info->shop_name . "\n$text_order_id" . "\nแจ้งเรื่อง : สั่งซื้ออะไหล่\nรายการ :\n\n" . implode("\n", $items);
            $body = [
                "receive_id" => $receive_id?->lark_token ?? 'unknown',
                "msg_type" => "text",
                "content" => json_encode(["text" => $text], JSON_UNESCAPED_UNICODE)
            ];
            $response = Http::post('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', [
                'app_id' => env('VITE_LARK_APP_ID'),
                'app_secret' => env('VITE_LARK_APP_SECRET')
            ]);
            if ($response->successful()) {
                $responseJson = $response->json();
                if ($responseJson['code'] === 10014) {
                    throw new \Exception('รหัสของแอปส่งการแจ้งเตือนไปยัง lark ไม่ถูกต้อง');
                }
                $tenant_access_token = $responseJson['tenant_access_token'];

                $responseSend = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $tenant_access_token,
                ])->post('https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=open_id', $body);
                if (!$responseSend->successful()) {
                    $message = 'สร้างคำสั่งซื้อเรียบร้อยแล้ว แต่ ไม่สามารถส่งการแจ้งเตือนไปหาตัวแทนจำหน่ายได้ [สร้าง body ไม่สำเร็จ]';
                    $order->update(['status_send_order' => false]);
                    //                    throw new \Exception('ไม่สามารถส่งการแจ้งเตือนไปหา lark ได้ send failed');
                }
            } else {
                $message = 'สร้างคำสั่งซื้อเรียบร้อยแล้ว แต่ ไม่สามารถส่งการแจ้งเตือนไปหาตัวแทนจำหน่ายได้ [สร้าง token lark ไม่สำเร็จ]';
                $order->update(['status_send_order' => false]);
                //                throw new \Exception('ไม่สามารถส่งการแจ้งเตือนไปหา lark ได้ crate Token failed');
            }
            DB::commit();
            return response()->json([
                'status' => 'success',
                'message' => $message ?? 'สร้างคำสั่งซื้อเรียบร้อยแล้ว',
                'order' => [
                    'order_id' => $order_id,
                    'total_price' => $totalOrderPrice,
                    'buy_at' => $order->buy_at,
                    'order' => $order
                ],
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order creation failed: ' . $e->getMessage(), [
                'user_id' => Auth::user()->id(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                //                'message' => 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ กรุณาลองใหม่ภายหลัง',
                'message' => $e->getMessage(),
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

    //ฟังก์ชั่น Export PDF หน้าสั่งซื้ออะไหล่
    // public function exportPdfFromCart(Request $request)
    // {
    //     try {
    //         Log::info('📥 เริ่ม Export PDF จาก Cart', $request->all());

    //         $groups = $request->input('groups', []);
    //         $address = $request->input('address', Auth::user()->store_info->address ?? '');
    //         $custName = Auth::user()->store_info->shop_name ?? Auth::user()->name;

    //         if (empty($groups)) {
    //             throw new \Exception("ไม่พบข้อมูลสินค้าในตะกร้า");
    //         }

    //         $payload = [
    //             "req" => "path",
    //             "regenqu" => "Y",
    //             "doc_title" => "ใบคำสั่งซื้อ (SO)",
    //             "typeservice" => "SO",
    //             "custaddr" => $address,
    //             "custnamesc" => $custName,
    //             "sku" => []
    //         ];

    //         foreach ($groups as $group) {
    //             foreach ($group['list'] as $sp) {
    //                 $payload["sku"][] = [
    //                     "pid"   => $sp['sp_code'] ?? null,
    //                     "name"  => $sp['sp_name'] ?? '',
    //                     "qty"   => $sp['qty'] ?? 1,
    //                     "unit"  => $sp['sp_unit'] ?? 'ชิ้น',
    //                     "price" => number_format($sp['price_per_unit'] ?? 0, 2, '.', '')
    //                 ];
    //             }
    //         }

    //         Log::info('📤 Payload ส่งไปยัง PDF API', $payload);

    //         // $response = Http::withHeaders([
    //         //     'Content-Type' => 'application/json'
    //         // ])->post("http://192.168.0.13/genpdf/api/gen_so", $payload);

    //         // if (!$response->successful()) {
    //         //     throw new \Exception("PDF API error: " . $response->body());
    //         // }

    //         // $body = trim($response->body());
    //         // $pdfUrl = null;

    //         // // ตรวจจับรูปแบบ URL หรือไฟล์ PDF
    //         // if (preg_match('/\.pdf$/i', $body)) {
    //         //     $pdfUrl = "http://192.168.0.13/genpdf/" . ltrim($body, '/');
    //         // } else {
    //         //     $decoded = json_decode($body, true);
    //         //     if (is_string($decoded)) {
    //         //         $pdfUrl = $decoded;
    //         //     }
    //         // }

    //         // if (!$pdfUrl) {
    //         //     throw new \Exception("ไม่สามารถตีความผลลัพธ์ PDF ได้");
    //         // }

    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //         ])->post("http://192.168.0.13/genpdf/api/get_req_pdf", $payload);

    //         if (!$response->successful()) {
    //             throw new \Exception("PDF API error: " . $response->body());
    //         }

    //         $body = trim($response->body());
    //         $pdfUrl = null;

    //         // กรณี response เป็น URL เต็ม เช่น "http://qupumpkin.dyndns.org:8130/_SO20251112154625.pdf"
    //         if (preg_match('/^https?:\/\/.*\.pdf$/i', $body)) {
    //             $pdfUrl = $body;

    //             // 🔹 กรณี response เป็นชื่อไฟล์ เช่น "_SO20251112154625.pdf"
    //         } elseif (preg_match('/\.pdf$/i', $body)) {
    //             $pdfUrl = "http://qupumpkin.dyndns.org:8130/" . ltrim($body, '/');

    //             // 🔹 กรณี response เป็น JSON เช่น {"path":"_SO20251112154625.pdf"}
    //         } else {
    //             $decoded = json_decode($body, true);
    //             if (is_array($decoded) && isset($decoded['path'])) {
    //                 $path = $decoded['path'];
    //                 $pdfUrl = preg_match('/^https?:\/\//i', $path)
    //                     ? $path
    //                     : "http://qupumpkin.dyndns.org:8130/" . ltrim($path, '/');
    //             } elseif (is_string($decoded) && preg_match('/\.pdf$/i', $decoded)) {
    //                 $pdfUrl = preg_match('/^https?:\/\//i', $decoded)
    //                     ? $decoded
    //                     : "http://qupumpkin.dyndns.org:8130/" . ltrim($decoded, '/');
    //             }
    //         }

    //         if (!$pdfUrl) {
    //             throw new \Exception("ไม่สามารถตีความผลลัพธ์ PDF ได้");
    //         }

    //         Log::info('✅ สำเร็จ PDF URL: ' . $pdfUrl);

    //         return redirect()->route('orders.carts')->with([
    //             'success' => 'ส่งออกใบคำสั่งซื้อเรียบร้อยแล้ว',
    //             'pdf_url' => $pdfUrl,
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('❌ Export PDF ล้มเหลว', [
    //             'message' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);

    //         return redirect()->route('orders.carts')->with([
    //             'error' => 'เกิดข้อผิดพลาดในการส่งออก PDF: ' . $e->getMessage()
    //         ]);
    //     }
    // }

    public function exportPdfFromCart(Request $request)
    {
        try {
            Log::info('📥 เริ่ม Export PDF จาก Cart', $request->all());

            $groups = $request->input('groups', []);
            if (empty($groups)) {
                throw new \Exception("ไม่พบข้อมูลสินค้าในตะกร้า");
            }

            $store = StoreInformation::where('is_code_cust_id', Auth::user()->is_code_cust_id)->first();

            $soNumber = 'SO-' . time();
            $storeName = $store->shop_name
                ?? Auth::user()->store_info->shop_name
                ?? Auth::user()->name
                ?? '-';
            $address = $store->address ?? $request->input('address', '-');
            $phone = $store->phone ?? $request->input('phone', '-');
            $date = now()->format('d/m/Y');

            $payload = [
                "req" => "path",
                "regenqu" => "Y",
                // "docno" => $soNumber,
                "doc_title" => "ใบเสนอราคา (QU)",
                "typeservice" => "so",

                "empproc"     => Auth::user()->name ?? 'system',
                "custsccode"  => Auth::user()->user_code ?? '-',
                "custscname"  => Auth::user()->name ?? '-',

                "custnamesc" => $storeName,
                "custname"   => $storeName,
                // "custscaddr" => $address,
                "custaddr" => $address,
                "custtel"    => $phone,
                "date"       => $date,

                "sku" => [],
            ];

            $sumBefore = 0;
            $sumDiscount = 0;
            $sumNet = 0;

            foreach ($groups as $group) {
                foreach ($group['list'] as $sp) {

                    $qty = floatval($sp['qty'] ?? 1);
                    $stdPrice = floatval($sp['price_per_unit'] ?? 0);
                    $discountPercent = 0;

                    $discountPerUnit = 0;
                    $sellPrice = $stdPrice;
                    $lineTotal = $sellPrice * $qty;

                    $sumBefore += ($stdPrice * $qty);
                    $sumDiscount += ($discountPerUnit * $qty);
                    $sumNet += $lineTotal;

                    $payload["sku"][] = [
                        "pid"            => $sp['sp_code'],
                        "name"           => $sp['sp_name'],
                        "qty"            => $qty,
                        "unit"           => $sp['sp_unit'] ?? 'ชิ้น',

                        "unitprice"      => number_format($stdPrice, 2, '.', ''),
                        "prod_discount"  => number_format($discountPercent, 2, '.', ''),

                        "discount"       => number_format($discountPerUnit, 2, '.', ''),
                        "discountamount" => number_format($discountPerUnit * $qty, 2, '.', ''),

                        "sell_price"     => number_format($sellPrice, 2, '.', ''),

                        "price"          => number_format($stdPrice, 2, '.', ''),
                        "priceperunit"   => number_format($stdPrice, 2, '.', ''),

                        "amount"         => number_format($lineTotal, 2, '.', ''),
                        "netamount"      => number_format($lineTotal, 2, '.', ''),
                        "net"            => number_format($lineTotal, 2, '.', ''),
                    ];
                }
            }

            $payload["summary"] = [
                "price_before_discount" => number_format($sumBefore, 2, '.', ''),
                "prod_discount"         => "0.00",
                "discount"              => number_format($sumDiscount, 2, '.', ''),
                "total_price"           => number_format($sumNet, 2, '.', ''),
                "net_total"             => number_format($sumNet, 2, '.', ''),
            ];

            Log::info('📤 Payload ส่งไปยัง PDF API (Cart)', $payload);

            $response = Http::withHeaders([
                'Content-Type' => 'application/json'
            ])->post("http://192.168.0.13/genpdf/api/get_req_pdf", $payload);

            if (!$response->successful()) {
                throw new \Exception("PDF API error: " . $response->body());
            }

            $body = trim($response->body());
            $pdfUrl = null;

            // URL ตรง ๆ
            if (preg_match('/^https?:\/\/.*\.pdf$/i', $body)) {
                $pdfUrl = $body;

                // ชื่อไฟล์
            } elseif (preg_match('/\.pdf$/i', $body)) {
                $pdfUrl = "http://qupumpkin.dyndns.org:8130/" . ltrim($body, '/');
            } else {
                $decoded = json_decode($body, true);

                if (is_array($decoded) && isset($decoded['path'])) {
                    $path = $decoded['path'];
                    $pdfUrl = preg_match('/^https?:\/\//i', $path)
                        ? $path
                        : "http://qupumpkin.dyndns.org:8130/" . ltrim($path, '/');
                } elseif (is_string($decoded) && preg_match('/\.pdf$/i', $decoded)) {
                    $pdfUrl = preg_match('/^https?:\/\//i', $decoded)
                        ? $decoded
                        : "http://qupumpkin.dyndns.org:8130/" . ltrim($decoded, '/');
                }
            }

            if (!$pdfUrl) {
                throw new \Exception("ไม่สามารถตีความผลลัพธ์ PDF ได้");
            }

            Log::info('✅ สำเร็จ PDF URL (Cart): ' . $pdfUrl);

            return response()->json([
                'success' => true,
                'pdf_url' => $pdfUrl,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Export PDF ล้มเหลว (Cart)', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการส่งออก PDF: ' . $e->getMessage(),
            ], 500);
        }
    }

    // เช็คสถานะคำสั่งซื้อจาก API ภายนอก
    // public function checkStatusOrder($order_id)
    // {
    //     try {
    //         DB::beginTransaction();
    //         $uri = env('VITE_API_CHECK_ORDER');
    //         $order_id_remove_prefix = str_replace('ORDER-', '', $order_id);
    //         $body = [
    //             'jobno' => $order_id_remove_prefix
    //         ];
    //         $response = Http::post($uri, $body);
    //         if ($response->successful() && $response->status() === 200) {
    //             $order = Order::query()->where('order_id', $order_id)->first();
    //             if ($order) {
    //                 $response_json = $response->json();
    //                 if ($response_json['status']) {
    //                     $order->status = $response_json['status'];
    //                     $order->save();
    //                 } else throw new \Exception('ไม่สามารถเชื่อมต่อกับ API ได้ กรุณาลองอีกครั้ง');
    //             } else throw new \Exception('ไม่สามารถเชื่อมต่อกับ API ได้ กรุณาลองอีกครั้ง');
    //         } else throw new \Exception('ไม่สามารถเชื่อมต่อกับ API ได้ กรุณาลองอีกครั้ง');
    //         DB::commit();
    //         return response()->json([
    //             'data' => $response_json
    //         ]);
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Error occurred',
    //             'error' => $e->getMessage()
    //         ], 400);
    //     }
    // }

    // public function checkStatusOrder($order_id): JsonResponse
    // {
    //     try {
    //         DB::beginTransaction();
    //         $uri = env('VITE_API_CHECK_ORDER');
    //         $order_id_remove_prefix = str_replace('ORDER-', '', $order_id);
    //         $body = [
    //             'jobno' => $order_id_remove_prefix
    //         ];
    //         $response = Http::post($uri, $body);

    //         if ($response->successful() && $response->status() === 200) {
    //             $order = Order::query()->where('order_id', $order_id)->first();
    //             if ($order) {
    //                 $response_json = $response->json();
    //                 if (isset($response_json['status']) && $response_json['status']) {
    //                     $order->status = $response_json['status'];
    //                     $order->save();

    //                     DB::commit();
    //                     return response()->json([
    //                         'status' => 'success',
    //                         'data' => $response_json
    //                     ]);
    //                 } else {
    //                     throw new \Exception('ไม่พบข้อมูลสถานะใน response');
    //                 }
    //             } else {
    //                 throw new \Exception('ไม่พบ order_id นี้ในระบบ');
    //             }
    //         } else {
    //             throw new \Exception('ไม่สามารถเชื่อมต่อกับ API ได้ กรุณาลองอีกครั้ง');
    //         }
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => $e->getMessage()
    //         ], 400);
    //     }
    // }

    public function checkStatusOrder($order_id): JsonResponse
    {
        try {
            DB::beginTransaction();
            $uri = env('VITE_API_CHECK_ORDER');
            $order_id_remove_prefix = str_replace('ORDER-', '', $order_id);
            $body = ['jobno' => $order_id_remove_prefix];

            // เริ่มต้น Log ก่อนเรียก API
            Log::info('📦 เริ่มเช็คสถานะออเดอร์', [
                'order_id' => $order_id,
                'endpoint' => $uri,
                'request_body' => $body
            ]);

            $response = Http::post($uri, $body);

            // Log Response ที่ได้จาก API
            Log::info('📩 API ตอบกลับ', [
                'order_id' => $order_id,
                'http_status' => $response->status(),
                'raw_body' => $response->body(),
            ]);

            if ($response->successful() && $response->status() === 200) {
                $order = Order::query()->where('order_id', $order_id)->first();

                if (!$order) throw new \Exception('ไม่พบ order_id นี้ในระบบ');

                $response_json = $response->json();
                $externalStatus = $response_json['status'] ?? null;

                // log สถานะก่อนและหลัง
                Log::info('🧾 สถานะปัจจุบันของออเดอร์', [
                    'order_id' => $order_id,
                    'status_old' => $order->status,
                    'status_from_api' => $externalStatus,
                ]);

                if ($externalStatus) {
                    $order->status = $externalStatus;
                    $order->save();

                    Log::info('✅ อัปเดตสถานะสำเร็จ', [
                        'order_id' => $order_id,
                        'status_new' => $order->status,
                    ]);
                }

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'data' => ['status' => $order->status]
                ]);
            } else {
                throw new \Exception('API ภายนอกไม่ตอบกลับหรือเกิดข้อผิดพลาด');
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ ตรวจสอบสถานะล้มเหลว', [
                'order_id' => $order_id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function getAllStatusOrders(): JsonResponse
    {
        try {
            $pendingOrders = Order::query()
                // ->whereNotIn('status', ['จัดส่งสำเร็จ', 'canceled', 'completed'])
                ->select('order_id', 'status', 'buy_at')
                ->orderBy('buy_at', 'desc')
                ->limit(100) // จำกัดไม่เกิน 100 orders ต่อครั้ง
                ->get();

            return response()->json([
                'status' => 'success',
                'count' => $pendingOrders->count(),
                'orders' => $pendingOrders
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get pending orders failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'ไม่สามารถดึงข้อมูล orders ได้',
                'orders' => []
            ], 500);
        }
    }

    public function updateOrderStatusFromNode(Request $request): JsonResponse
    {
        try {
            $orderId = $request->input('order_id');
            $newStatus = $request->input('status');
            if (!$orderId || !$newStatus) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'กรุณาระบุ order_id และ status'
                ], 400);
            }
            DB::beginTransaction();
            $order = Order::query()->where('order_id', $orderId)->first();
            if (!$order) {
                DB::rollBack();
                return response()->json([
                    'status' => 'error',
                    'message' => 'ไม่พบ order_id นี้ในระบบ'
                ], 404);
            }
            // อัปเดตเฉพาะเมื่อสถานะเปลี่ยนแปลง
            if ($order->status !== $newStatus) {
                $order->status = $newStatus;
                $order->updated_at = now();
                $order->save();

                Log::info("Order {$orderId} status updated to {$newStatus} by Node Cron");
            }
            DB::commit();
            return response()->json([
                'status' => 'success',
                'message' => 'อัปเดตสถานะสำเร็จ',
                'order' => [
                    'order_id' => $order->order_id,
                    'status' => $order->status
                ]
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update order status from Node failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'เกิดข้อผิดพลาดในการอัปเดตสถานะ'
            ], 500);
        }
    }
}
