<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use Validator;
use Session;
use Auth;
use Illuminate\Support\MessageBag;
use Redis;

class LoginController extends Controller
{
	public function getLogin() {
		return view('login');
	}
	public function postLogin(Request $request) {
		$rules = [
			'email' =>'required|email',
			'password' => 'required|min:8'
		];
		$messages = [
			'email.required' => 'Email là trường bắt buộc',
			'email.email' => 'Email không đúng định dạng',
			'password.required' => 'Mật khẩu là trường bắt buộc',
			'password.min' => 'Mật khẩu phải chứa ít nhất 8 ký tự',
		];
		$validator = Validator::make($request->all(), $rules, $messages);

		if ($validator->fails()) {

			return redirect()->back()->withErrors($validator)->withInput();
		} else {
			$email = $request->input('email');
			$password = $request->input('password');

			if( Auth::attempt(['email' => $email, 'password' =>$password])) {
				$user = Auth::user()['id'];
				Redis::set('session_'.Auth::user()['id'], Session::getId());
				return redirect()->intended('/demosocket/');
			} else {
				$errors = new MessageBag(['errorlogin' => 'Email hoặc mật khẩu không đúng']);
				return redirect()->back()->withInput()->withErrors($errors);
			}
		}
	}
	public function getLogout (Request $request){
		Auth::logout();
		Redis::set('session_1', "");
		return redirect('/demosocket/');
	}

	
}
