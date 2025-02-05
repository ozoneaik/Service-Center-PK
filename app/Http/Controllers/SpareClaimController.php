<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class SpareClaimController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('SpareClaim/ClaimPending');
    }

    public function historyShow() : Response
    {
        return Inertia::render('SpareClaim/HistoryClaim');
    }
}
