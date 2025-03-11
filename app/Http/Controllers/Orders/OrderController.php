<?php

namespace App\Http\Controllers\Orders;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderRequest;
use App\Models\Order;
use App\Models\OrderSpList;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Orders/OrderList');
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
                        $result['sp'][$key]['path_file'] = $imagePath . "$sku/" . $result['sp'][$key]['spcode'] . ".jpg";
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
            ->where('is_code_key',auth()->user()->is_code_cust_id)
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
        return Inertia::render('Orders/OrderHistoryDetail',['order' => $order,'listSp' => $listSp,'customer'=>$customer]);
    }

    public function orderSuccess(): Response
    {
        return Inertia::render('Orders/OrderSuccess');
    }

}
