<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\ReservationRepository;

class ReservationsController {
    private $repository;

    public function __construct() {
        $this->repository = new ReservationRepository();
    }

    public function store(Request $request, Response $response) {
        $data = json_decode($request->getBody()->getContents(), true);
        
        $reservation = $this->repository->create($data);
        
        $response->getBody()->write(json_encode($reservation));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    public function index(Request $request, Response $response) {
        $reservations = $this->repository->getAll();
        $response->getBody()->write(json_encode($reservations));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function cancel(Request $request, Response $response, $args) {
        $id = $args['id'];
        $reservation = $this->repository->cancel($id);

        if ($reservation) {
            $response->getBody()->write(json_encode(['message' => 'Reserva cancelada', 'data' => $reservation]));
        } else {
            $response->getBody()->write(json_encode(['error' => 'Reserva no encontrada']));
            return $response->withStatus(404);
        }
        
        return $response->withHeader('Content-Type', 'application/json');
    }
}