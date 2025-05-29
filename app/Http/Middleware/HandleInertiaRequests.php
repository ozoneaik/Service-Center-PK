<?php

namespace App\Http\Middleware;

use App\Models\SaleInformation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = Auth::user();
        $store = $user->store_info ?? null;
        $saleInfo = null;
        if ($store && $store->sale_id) {
            $saleInfo = SaleInformation::query()
                ->where('sale_code', $store->sale_id)
                ->select('sale_code', 'name as sale_name')
                ->first();
        }
        return [
            ...parent::share($request),
            'flash' => [
                'message' => fn() => $request->session()->get('message'),
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
            'auth' => [
                // 'user' => $request->user(),
//                'user' => Auth::user() ? Auth::user()->load('store_info') : null,
                'user' => $user,
                'store_info' => $store,
                'sale_info' => $saleInfo,
            ],
        ];
    }
}
