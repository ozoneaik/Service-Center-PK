<?php

namespace App\Http\Middleware;

use App\Models\ListMenu;
use App\Models\UserAccessMenu;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class DealerAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return $next($request);
        }

        $menuIds = UserAccessMenu::where('user_code', $user->user_code)->pluck('menu_code');

        // sale ที่มีสิทธิ์เมนูร้านค้าให้ผ่านได้
        if ($user->role === 'sale') {
            $hasDealerAccess = ListMenu::whereIn('id', $menuIds)
                ->whereIn('redirect_route', ['dealerRepair.index', 'sale.dealer.jobs.index'])
                ->exists();

            if ($hasDealerAccess) {
                return $next($request);
            }
        }

        $hasAccess = ListMenu::whereIn('id', $menuIds)
            ->where('redirect_route', 'dealerRepair.index')
            ->exists();

        if (!$hasAccess) {
            return redirect()->route('unauthorized');
        }

        return $next($request);
    }
}
