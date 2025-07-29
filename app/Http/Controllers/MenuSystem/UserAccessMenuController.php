<?php

namespace App\Http\Controllers\MenuSystem;

use App\Http\Controllers\Controller;
use App\Models\UserAccessMenu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserAccessMenuController extends Controller
{
    public function index(){
        return UserAccessMenu::query()->where('user_code',Auth::user()->user_code)->get();
    }

    public function store(){
        
    }
}
