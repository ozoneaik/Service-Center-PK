<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function detail(Request $request)
    {
        $response = Http::post(env('API_DETAIL'), [
            'sn' => $request->sn,
            'views' => $request->views,
        ]);
        $searchResults = $response->json();
//        $listBehavior = $searchResults['assets'][0]['listbehavior'];
//        $sp = $searchResults['assets'][0]['sp'];
//        $searchResults['assets'][0]['sp'] = $this->formatSp($sp);
//        $searchResults['assets'][0]['listbehavior'] = $this->formatListBehavior($listBehavior);
        return response()->json([
            'searchResults' => $searchResults
        ]);
    }

    public function formatListBehavior($data): array
    {
        $groupedData = [];
        foreach ($data as $key => $item) {
            $behaviorName = $item['behaviorname'];
            if (!isset($groupedData[$behaviorName])) {
                $groupedData[$behaviorName] = [];
            }
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
        return $groupedDataArray;
    }

    public function formatSp($data) : array{

        $count = 0;
        $new_format = [];
        foreach ($data as $key=>$d) {
            $parts = explode('|', $d);
            $new_format[$count] = [
                'key' => $key,
                'sp_code' => $parts[0],
                'name' => $parts[1],
                'z' => isset($parts[3]) ? $parts[3] : '',
                'status' => end($parts)
            ];
            $count++;
        }

        return $new_format;
    }
}
