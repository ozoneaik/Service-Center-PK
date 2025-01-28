<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function detail(Request $request): Response
    {
        $response = Http::post(env('API_DETAIL'), [
            'sn' => $request->sn,
            'views' => $request->views,
        ]);
        return Inertia::render('Dashboard', [
            'searchResults' =>  $response->json(),
        ]);
    }
}
