<?php

namespace App\Http\Controllers;

use App\Models\NotificationNew;
use App\Models\GroupStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class NotificationNewController extends Controller
{
    /**
     * GET /admin/config/notifications
     * ดึงรายการ notifications พร้อม groups
     */
    public function index()
    {
        $notifications = NotificationNew::with('groups', 'creator', 'updater')
            ->orderBy('start_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $notifications
        ]);
    }

    /**
     * POST /admin/config/notifications
     * สร้าง notification ใหม่
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'groups' => 'required|array',
            'groups.*' => 'exists:group_stores,id',
            'start_at' => 'required|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $notification = NotificationNew::create([
            'title' => $request->title,
            'message' => $request->message,
            'start_at' => $request->start_at,
            'end_at' => $request->end_at,
            'status' => 'new',
            'created_by' => Auth::id(),
        ]);

        // เชื่อมกับกลุ่มร้าน
        $notification->groups()->sync($request->groups);

        return response()->json([
            'status' => true,
            'message' => 'Notification created successfully',
            'data' => $notification->load('groups')
        ]);
    }

    /**
     * PATCH /admin/config/notifications/{id}/status
     * อัปเดต status ของ notification
     */
    public function updateStatus($id)
    {
        $notification = NotificationNew::find($id);
        if (!$notification) {
            return response()->json([
                'status' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        // อัปเดต status อัตโนมัติตามเวลาปัจจุบัน
        $now = now();

        if ($notification->status !== 'off') {
            if ($now->lt($notification->start_at)) {
                $notification->status = 'new';
            } elseif ($now->between($notification->start_at, $notification->end_at ?? $now)) {
                $notification->status = 'in_progress';
            } elseif ($notification->end_at && $now->gt($notification->end_at)) {
                $notification->status = 'done';
            }
            $notification->updated_by = Auth::id();
            $notification->save();
        }

        return response()->json([
            'status' => true,
            'data' => $notification
        ]);
    }

    public function notificationsList()
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
}
