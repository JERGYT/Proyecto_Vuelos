<?php
namespace App\Repositories;
use App\Models\Nave;

class NaveRepository {
    public function getAll() {
        return Nave::all();
    }
    public function create($data) {
        return Nave::create($data);
    }

    public function delete($id) {
        $nave = Nave::find($id);
        if ($nave) {
            return $nave->delete();
        }
        return false;
    }
    public function findByName($name) {
        return Nave::where('name', $name)->first();
    }
}