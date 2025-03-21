<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use phpDocumentor\Reflection\DocBlock\Tags\Author;
use Symfony\Component\HttpFoundation\Response;

class AdminBranchAccess
{
    /**
     * Handle an incoming request.
     *
     * @param Closure(Request): (Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        if ((Auth::user()->admin_that_branch && Auth::user()->role === 'service') || Auth::user()->role === 'admin'){
            return $next($request);
        }
        return Redirect::route('unauthorized');

    }
}
