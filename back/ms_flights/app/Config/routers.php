<?php
use Slim\App;
use App\Controllers\FlightsController;
use App\Middleware\AuthMiddleware;
use App\Controllers\ReservationsController;

return function (App $app) {
    

    $app->group('/api', function ($group) {
        
        $group->get('/flights', [FlightsController::class, 'index']);
        $group->post('/flights', [FlightsController::class, 'store']);

        $group->get('/reservations', [ReservationsController::class, 'index']);
        $group->post('/reservations', [ReservationsController::class, 'store']);
        $group->put('/reservations/{id}/cancel', [ReservationsController::class, 'cancel']);
        
    })->add(new AuthMiddleware());
};