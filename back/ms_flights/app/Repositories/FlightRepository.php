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
            ->orWhere('departure', 'like', "%$query%")
            ->get();
    }

    public function update($id, $data) {
        $flight = Flight::find($id);
        if ($flight) {
            $flight->update($data);
            return $flight;
        }
        return null;
    }

    public function delete($id) {
        $flight = Flight::find($id);
        if ($flight) return $flight->delete();
        return false;
    }
}