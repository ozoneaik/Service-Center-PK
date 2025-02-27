<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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

        if ((auth()->user()->admin_that_branch && auth()->user()->role === 'service') || auth()->user()->role === 'admin'){
            return $next($request);
        }
        return Redirect::route('unauthorized');

    }
}
