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

    public function getAll() {
        return User::all();
    }

    public function findById($id) {
        return User::find($id);
    }

    public function create($data) {
        return User::create($data);
    }

    public function update($id, $data) {
        $user = User::find($id);
        if ($user) {
            $user->update($data);
            return $user;
        }
        return null;
    }

    public function delete($id) {
        $user = User::find($id);
        if ($user) {
            return $user->delete();
        }
        return false;
    }
}