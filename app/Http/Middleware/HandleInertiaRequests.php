<?php

namespace App\Http\Middleware;

use App\Models\ListMenu;
use App\Models\SaleInformation;
use App\Models\UserAccessMenu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    // public function share(Request $request): array
    // {
    //     $user = $request->user();
    //     if (!$user) {
    //         return ['user' => null];
    //     } else {
    //         $store = $user->store_info ?? null;
    //         $saleInfo = null;

    //         if ($store && $store->sale_id) {
    //             $saleInfo = SaleInformation::query()
    //                 ->where('sale_code', $store->sale_id)
    //                 ->select('sale_code', 'name as sale_name')
    //                 ->first();
    //         }

    //         if ($user->role === 'admin' || $user->admin_that_branch) {
    //             $access_menu = ListMenu::all();
    //         } else {
    //             $menu_formatted = [];
    //             if ($user->access_menu) {
    //                 foreach ($user->access_menu as $key => $item) {
    //                     $menu = ListMenu::query()->where('id', $item['menu_code'])->first();
    //                     if ($menu) {
    //                         $menu_formatted[] = $menu;
    //                     }
    //                 }
    //             }
    //             $access_menu = $menu_formatted;
    //         }

    //         // แปลงเป็น Collection เพื่อให้จัดการง่าย
    //         $access_menu = collect($access_menu);

    //         // 1. Logic สำหรับ SALE (เดิม)
    //         $saleRouteName = 'repair.sale.index';

    //         if ($user->role === 'sale') {
    //             $hasSaleMenu = $access_menu->contains('redirect_route', $saleRouteName);

    //             if (!$hasSaleMenu) {
    //                 $saleMenu = ListMenu::where('redirect_route', $saleRouteName)->first();
    //                 if ($saleMenu) {
    //                     $access_menu->push($saleMenu);

    //                     // เช็ค Header Group
    //                     $groupId = $saleMenu->group;
    //                     $hasHeader = $access_menu->where('group', $groupId)->where('main_menu', true)->isNotEmpty();
    //                     if (!$hasHeader) {
    //                         $headerMenu = ListMenu::where('group', $groupId)->where('main_menu', true)->first();
    //                         if ($headerMenu) $access_menu->push($headerMenu);
    //                     }
    //                 }
    //             }
    //         }
    //         // ลบเมนู Sale ออกถ้าไม่ใช่ Admin หรือ Sale
    //         else if ($user->role !== 'admin') {
    //             $access_menu = $access_menu->reject(function ($menu) use ($saleRouteName) {
    //                 return $menu->redirect_route === $saleRouteName;
    //             });
    //         }

    //         // Logic สำหรับ SERVICE (ยัดเมนูบังคับ)
    //         if ($user->role === 'service') {
    //             $serviceRoutes = [
    //                 'repair.index',          // แจ้งซ่อม (Group 1)
    //                 'history.index',         // ประวัติการซ่อม (Group 2)
    //                 'repair.receive.index'   // รับงานเซลล์แจ้งซ่อม (Group 2)
    //             ];

    //             foreach ($serviceRoutes as $route) {
    //                 // ตัวแปรสำหรับเก็บเมนู item (ไม่ว่าจะมาจากที่มีอยู่แล้ว หรือดึงใหม่)
    //                 $menuItem = null;

    //                 // A. เช็คว่ามีเมนูลูกหรือยัง
    //                 if ($access_menu->contains('redirect_route', $route)) {
    //                     // ถ้ามีอยู่แล้ว ให้ดึง object ออกมาจาก collection เพื่อเอาไปหา groupId
    //                     $menuItem = $access_menu->firstWhere('redirect_route', $route);
    //                 } else {
    //                     // ถ้ายังไม่มี ให้ดึงจาก DB และยัดใส่ collection
    //                     $menuItem = ListMenu::where('redirect_route', $route)->first();
    //                     if ($menuItem) {
    //                         $access_menu->push($menuItem);
    //                     }
    //                 }

    //                 // B. ถ้าได้ตัว Item มาแล้ว ให้เช็ค Header ของกลุ่มนั้นเสมอ (แยกออกมาจาก if ด้านบน)
    //                 if ($menuItem) {
    //                     $groupId = $menuItem->group;

    //                     // เช็คว่าใน collection มี Header (main_menu=true) ของกลุ่มนี้หรือยัง
    //                     // ใช้ loose comparison (ไม่เช็ค type) เผื่อ DB return เป็น 0/1
    //                     $hasHeader = $access_menu->where('group', $groupId)
    //                         ->filter(function ($value) {
    //                             return $value['main_menu'] == true;
    //                         })
    //                         ->isNotEmpty();

    //                     if (!$hasHeader) {
    //                         // ถ้าไม่มี Header ให้ไปดึงจาก DB มาใส่
    //                         $headerMenu = ListMenu::where('group', $groupId)
    //                             ->where('main_menu', true)
    //                             ->first();

    //                         if ($headerMenu) {
    //                             $access_menu->push($headerMenu);
    //                         }
    //                     }
    //                 }
    //             }
    //         }

    //         return [
    //             ...parent::share($request),
    //             'flash' => [
    //                 'message' => fn() => $request->session()->get('message'),
    //                 'success' => fn() => $request->session()->get('success'),
    //                 'error' => fn() => $request->session()->get('error'),
    //             ],
    //             'auth' => [
    //                 'user' => $user,
    //                 'sale_info' => $saleInfo,
    //                 // values() เพื่อเรียง index array ใหม่ (0,1,2,...) ป้องกัน JS ฝั่งหน้าบ้านงง
    //                 'access_menu' => $access_menu->unique('id')->values()->all()
    //             ],
    //         ];
    //     }
    // }

    //เช็คเงื่อนไขสำหรับเซลล์อย่างเดียว
    public function share(Request $request): array
    {
        $user = $request->user();
        if (!$user) {
            return ['user' => null];
        }else{
            $store = $user->store_info ?? null;
            $saleInfo = null;

            if ($store && $store->sale_id) {
                $saleInfo = SaleInformation::query()
                    ->where('sale_code', $store->sale_id)
                    ->select('sale_code', 'name as sale_name')
                    ->first();
            }

            if ($user->role === 'admin' || $user->admin_that_branch) {
                $access_menu = ListMenu::all();
            } else {
                $menu_formatted = [];
                // ตรวจสอบว่า access_menu มีค่าหรือไม่เพื่อป้องกัน error
                if ($user->access_menu) {
                    foreach ($user->access_menu as $key => $item) {
                        $menu = ListMenu::query()->where('id', $item['menu_code'])->first();
                        if ($menu) {
                            $menu_formatted[] = $menu;
                        }
                    }
                }
                $access_menu = $menu_formatted;
            }
            // [ส่วนที่เพิ่ม] Logic บังคับเมนู "เซลล์แจ้งซ่อม"
            // แปลงเป็น Collection เพื่อให้จัดการง่าย (เผื่อกรณีเป็น Array มา)
            $access_menu = collect($access_menu);
            $saleRouteName = 'repair.sale.index';

            if ($user->role === 'sale') {
                // กรณีเป็น SALE: เช็คว่ามีเมนูนี้หรือยัง ถ้ายังไม่มีให้ "ยัด" เข้าไปเลย
                $hasSaleMenu = $access_menu->contains('redirect_route', $saleRouteName);

                if (!$hasSaleMenu) {
                    $saleMenu = ListMenu::where('redirect_route', $saleRouteName)->first();
                    if ($saleMenu) {
                        $access_menu->push($saleMenu);

                        // [เพิ่มเติม] ต้องดึงหัวข้อหลัก (Main Menu) ของ Group 1 มาด้วย 
                        // ไม่งั้นเมนูย่อยอาจจะไม่มีที่เกาะ (ถ้า Sale ไม่ได้สิทธิ์ Group 1 มาก่อน)
                        $groupId = $saleMenu->group;
                        $hasHeader = $access_menu->where('group', $groupId)->where('main_menu', true)->isNotEmpty();

                        if (!$hasHeader) {
                            $headerMenu = ListMenu::where('group', $groupId)->where('main_menu', true)->first();
                            if ($headerMenu) $access_menu->push($headerMenu);
                        }
                    }
                }
            } else {
                // กรณีไม่ใช่ SALE (และไม่ใช่ Admin ถ้าอยากกัน Admin ด้วย): ลบเมนูนี้ออก
                // แต่ถ้าอยากให้ Admin เห็นด้วย ให้แก้เงื่อนไขเป็น if ($user->role !== 'sale' && $user->role !== 'admin')
                if ($user->role !== 'admin') {
                    $access_menu = $access_menu->reject(function ($menu) use ($saleRouteName) {
                        return $menu->redirect_route === $saleRouteName;
                    });
                }
            }
            return [
                ...parent::share($request),
                'flash' => [
                    'message' => fn() => $request->session()->get('message'),
                    'success' => fn() => $request->session()->get('success'),
                    'error' => fn() => $request->session()->get('error'),
                ],
                'auth' => [
                    'user' => $user,
                    'sale_info' => $saleInfo,
                    // ส่งกลับไปเป็น array (values เพื่อเรียง index ใหม่)
                    'access_menu' => $access_menu->values()->all()
                ],
            ];
        }
    }

    // ตัวเดิม
    // public function share(Request $request): array
    // {
    //     $user = $request->user();
    //     if (!$user) {
    //         return ['user' => $request->user()];
    //     }else{
    //         $store = $user->store_info ?? null;
    //         $saleInfo = null;

    //         if ($store && $store->sale_id) {
    //             $saleInfo = SaleInformation::query()
    //                 ->where('sale_code', $store->sale_id)
    //                 ->select('sale_code', 'name as sale_name')
    //                 ->first();
    //         }

    //         if ($user->role === 'admin' || $user->admin_that_branch) {
    //             $access_menu = ListMenu::all();
    //         } else {
    //             $menu_formatted = [];
    //             foreach ($user->access_menu as $key=>$item) {
    //                 $menu_formatted[$key] = ListMenu::query()->where('id', $item['menu_code'])->first();
    //             }
    //             $access_menu = $menu_formatted ?? [];
    //         }
    //         return [
    //             ...parent::share($request),
    //             'flash' => [
    //                 'message' => fn() => $request->session()->get('message'),
    //                 'success' => fn() => $request->session()->get('success'),
    //                 'error' => fn() => $request->session()->get('error'),
    //             ],
    //             'auth' => [
    //                 // 'user' => $request->user(),
    //                 'user' => $user,
    //                 'sale_info' => $saleInfo,
    //                 'access_menu' => $access_menu
    //             ],
    //         ];
    //     }
    // }
}
