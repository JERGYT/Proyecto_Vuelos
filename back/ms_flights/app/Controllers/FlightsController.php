<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\FlightRepository;

class FlightsController {
    private $repository;

    public function __construct() {
        $this->repository = new FlightRepository();
    }

    public function index(Request $request, Response $response) {
        $flights = $this->repository->getAll();
        $response->getBody()->write(json_encode($flights));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function store(Request $request, Response $response) {
        $data = json_decode($request->getBody()->getContents(), true);
        $flight = $this->repository->create($data);
        $response->getBody()->write(json_encode($flight));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }
}