<?php
namespace App\Repositories;
use App\Models\User;

class UserRepository {
    public function findByEmail($email) {
        return User::where('email', $email)->first();
    }

    public function updateToken($id, $token) {
        $user = User::find($id);
        if ($user) {
            $user->token = $token;
            $user->save();
        }
    }
}