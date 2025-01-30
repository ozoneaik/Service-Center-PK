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
        $searchResults = $response->json();
        $groupedData = [];
        foreach ($searchResults['assets'][0]['listbehavior'] as $key=>$item) {
            $behaviorName = $item['behaviorname'];

            // ถ้ายังไม่มี behaviorname นี้ใน groupedData ให้เพิ่มเข้าไป
            if (!isset($groupedData[$behaviorName])) {
                $groupedData[$behaviorName] = [];
            }

            // เพิ่มข้อมูลลงในกลุ่ม
            $groupedData[$behaviorName][] = [
                'catalog' => $item['catalog'],
                'subcatalog' => $item['subcatalog'],
                'causecode' => $item['causecode'],
                'causename' => $item['causename']
            ];
        }

        $groupedDataArray = [];
        $count = 0;
        foreach ($groupedData as $behaviorName => $items) {
            $groupedDataArray[$count]['groupName'] = $behaviorName;
                $groupedDataArray[$count]['items'] = $items;
                $count++;
        }

        $searchResults['assets'][0]['listbehavior'] = $groupedDataArray;
        return Inertia::render('Dashboard', [
            'searchResults' =>  $searchResults
        ]);
    }
}
