<?php
namespace App\Repositories;
use App\Models\Flight;

class FlightRepository {
    public function getAll() {
        return Flight::with('nave')->get();
    }

    public function create($data) {
        return Flight::create($data);
    }
    
    public function search($query) {
        return Flight::with('nave')
            ->where('origin', 'like', "%$query%")
            ->orWhere('destination', 'like', "%$query%")
            ->get();
    }
}