<?php
namespace App\Repositories;
use App\Models\Reservation;

class ReservationRepository {
    
    public function create($data) {
        return Reservation::create($data);
    }

    public function getAll() {
        return Reservation::with(['flight.nave'])->get();
    }

    public function getByUserId($userId) {
        return Reservation::with(['flight'])->where('user_id', $userId)->get();
    }

    public function cancel($id) {
        $reservation = Reservation::find($id);
        if ($reservation) {
            $reservation->status = 'cancelada';
            $reservation->save();
            return $reservation;
        }
        return null;
    }
}