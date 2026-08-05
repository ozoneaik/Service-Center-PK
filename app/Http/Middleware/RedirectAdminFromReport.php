<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectAdminFromReport
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && Auth::user()->role === 'admin') {
            $path = $request->path();
            $newPath = preg_replace('#^report/#', 'admin/', $path);
            if ($newPath !== $path) {
                $query = $request->getQueryString();
                return redirect('/' . $newPath . ($query ? '?' . $query : ''));
            }
        }

        return $next($request);
    }
}
