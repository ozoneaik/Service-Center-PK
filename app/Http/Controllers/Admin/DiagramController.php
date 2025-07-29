<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ImageDiagram;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiagramController extends Controller
{
    public function index()
    {
        $dm_list = ImageDiagram::orderBy('id', 'desc')->paginate(50);
        return Inertia::render('Admin/Diagrams/DmList', ['dm_list' => $dm_list]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Diagrams/DmCreateUpdate', [
            'action' => 'create',
            'dm_data' => [
                'id' => 0,
                'sku_code' => '',
                'fac_model' => '',
                'dm_type' => 'DM01',
                'layer' => 'รูปที่ 1',
                'path_file' => env('VITE_IMAGE_DEFAULT')
            ]
        ]);
    }

    public function edit($id): Response
    {
        $dm_data = ImageDiagram::query()->where('id', $id)->first();
        return Inertia::render('Admin/Diagrams/DmCreateUpdate', [
            'action' => 'edit',
            'id' => $id,
            'dm_data' => $dm_data,
        ]);
    }

    public function createFromExel(): Response
    {
        return Inertia::render('Admin/Diagrams/DmCreateExel');
    }

    public function store(Request $request)
    {
        $req = $request->all();
        if ($req['multi_form']){
            $form_list = $req['form_list'];
            foreach($form_list as $form) {

            }
        }else{
            $store_diagram = ImageDiagram::query()->create([
                'sku_code' => $req['sku_code'],
                'fac_model' => $req['fac_model'],
                'dm_type' => $req['dm_type'],
                'layer' => $req['layer'],
                'path_file' => $req['path_file'],
            ]);
        }

        return redirect()->back()->with(['message'=> 'success']);

    }

    public function softDelete($id)
    {
    }

    public function destroy($id)
    {
        ImageDiagram::query()->where('id', $id)->delete();
        return redirect()->back()->with(['message'=> 'success']);
    }

    public function restore()
    {

    }
}
