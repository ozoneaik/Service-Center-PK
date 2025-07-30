<?php

namespace App\Http\Middleware;

use App\Models\UserAccessMenu;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;

class MenuAccess
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $permission = false;
        if (Auth::user()->admin_that_branch || Auth::user()->role === 'admin') {
            return $next($request);
        } else {
            $menu_access = UserAccessMenu::query()
                ->leftJoin('list_menus', 'list_menus.id', '=', 'user_access_menus.menu_code')
                ->where('user_access_menus.user_code', Auth::user()->user_code)
                ->select('list_menus.*')->get();
            foreach ($menu_access as $key=>$menu) {
                if($menu->redirect_route === Route::currentRouteName()){
                    $permission = true;
                }
            }

            if(!$permission){
                return Redirect::route('unauthorized');
            }else{
                return $next($request);
            }
        }
    }
}
