<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class AdminSps extends Model
{
    protected $connection = 'diagram_list';
    protected $table = 'data_file';

    protected $fillable = [
        'serial',
        'skusp',
        'skuspname',
        'skuspunit',
        'pathfile_sp',
        'namefile_sp',
        'skufg',
        'skufgname',
        'modelfg',
        'pathfile_dm',
        'namefile_dm',
        'typedm',
        'pathfile_manual',
        'namefile_manual',
        'createon',
        'price'
    ];
}
