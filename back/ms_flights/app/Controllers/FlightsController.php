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
        if (isset($data['price']) && $data['price'] < 0) {
            $response->getBody()->write(json_encode(['error' => 'El precio no puede ser negativo']));
            return $response->withStatus(400);
        }
        $flight = $this->repository->create($data);
        $response->getBody()->write(json_encode($flight));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    public function update(Request $request, Response $response, $args) {
        $id = $args['id'];
        $data = json_decode($request->getBody()->getContents(), true);
        $flight = $this->repository->update($id, $data);
        if ($flight) {
            $response->getBody()->write(json_encode(['message' => 'Vuelo actualizado']));
        } else {
            return $response->withStatus(404);
        }
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function delete(Request $request, Response $response, $args) {
        $id = $args['id'];
        if ($this->repository->delete($id)) {
            $response->getBody()->write(json_encode(['message' => 'Vuelo eliminado']));
        } else {
            return $response->withStatus(404);
        }
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function search(Request $request, Response $response) {
        $params = $request->getQueryParams();
        $query = $params['q'] ?? '';
        $flights = $this->repository->search($query);
        $response->getBody()->write(json_encode($flights));
        return $response->withHeader('Content-Type', 'application/json');
    }
}