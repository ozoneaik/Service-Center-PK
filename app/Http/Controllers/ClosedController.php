<?php

namespace App\Http\Controllers;

use App\Models\GroupStore;
use App\Models\NotificationNew;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class ClosedController extends Controller
{
    // หน้าแจ้งปิดระบบ (ลูกค้าเห็น)
    public function index(): Response
    {
        return Inertia::render('Closed');
    }


    public function getNotifications()
    {
        $notifications = NotificationNew::with('groups')
            ->orderBy('start_at', 'desc')
            ->get()
            ->map(function ($n) {
                return [
                    'id' => $n->id,
                    'title' => $n->title,
                    'message' => $n->message,
                    'status' => match ($n->status) {
                        'new' => 'ใหม่',
                        'in_progress' => 'กำลังทำงาน',
                        'done' => 'เสร็จสิ้น',
                        'off' => 'ปิดการใช้งาน',
                        default => $n->status,
                    },
                    'date' => $n->start_at?->format('Y-m-d H:i'),
                    'end_date' => $n->end_at?->format('Y-m-d H:i'),
                    'groups' => $n->groups->pluck('name')->toArray(),
                ];
            });

        return response()->json([
            'status' => true,
            'data' => $notifications
        ]);
    }


    // หน้า config (admin ตั้งค่า)
    public function configClosed(): Response
    {
        return Inertia::render('Admin/ClosedConfig');
    }

    // API ดึงกลุ่มลูกค้า
    public function getGroups(): JsonResponse
    {
        $groupsList = GroupStore::all();

        return response()->json([
            'status' => true,
            'data' => $groupsList
        ]);
    }
}
