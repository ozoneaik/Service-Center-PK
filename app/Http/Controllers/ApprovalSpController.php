<?php

namespace App\Http\Controllers;
use App\Models\SparePart;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalSpController extends Controller
{
    public function index(): Response
    {
        $listSp = SparePart::query()
            ->where('approve','yes')
            ->where('approve_status','no')
            ->orderBy('id')
            ->get();
        return Inertia::render('ApprovalSpPage/ApprovalSp', [
            'listSp' => $listSp,
        ]);
    }
}
