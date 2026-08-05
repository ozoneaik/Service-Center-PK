<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;

class RedirectAdminFromReport
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && Auth::user()->role === 'admin') {
            $path = $request->path();
            $newPath = preg_replace('#^report/#', 'admin/', $path);
            if ($newPath !== $path) {
                try {
                    // Check if a route exists for the new admin path before redirecting
                    $fakeRequest = Request::create('/' . $newPath, $request->method());
                    Route::getRoutes()->match($fakeRequest);

                    $query = $request->getQueryString();
                    return redirect('/' . $newPath . ($query ? '?' . $query : ''));
                } catch (\Throwable $e) {
                    // Route does not exist, so proceed without redirecting
                }
            }
        }

        return $next($request);
    }
}
