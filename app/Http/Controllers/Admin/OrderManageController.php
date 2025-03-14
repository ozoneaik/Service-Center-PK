<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderManageController extends Controller
{
    public function list()
    {
        $orderList = Order::query()
            ->where('status','pending')
            ->paginate(50);
        return Inertia::render('DealerPage/Orders/OrderMain',['orderList'=>$orderList]);
    }
}
