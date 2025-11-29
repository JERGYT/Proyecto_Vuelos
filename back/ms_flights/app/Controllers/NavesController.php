<?php
namespace App\Controllers;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\NaveRepository;

class NavesController {
    private $repository;

    public function __construct() {
        $this->repository = new NaveRepository();
    }

    public function index(Request $request, Response $response) {
        $naves = $this->repository->getAll();
        $response->getBody()->write(json_encode($naves));
        return $response->withHeader('Content-Type', 'application/json');
    }
    public function store(Request $request, Response $response) {
        $data = json_decode($request->getBody()->getContents(), true);
        
        if (!isset($data['name']) || !isset($data['model'])) {
            $response->getBody()->write(json_encode(['error' => 'Faltan datos obligatorios']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $nombreOriginal = trim($data['name']);
        
        if (stripos($nombreOriginal, 'Aeronave') !== 0) {
            $data['name'] = 'Aeronave ' . $nombreOriginal;
        } else {
            $data['name'] = ucfirst($nombreOriginal); 
        }

        $existe = $this->repository->findByName($data['name']);
        
        if ($existe) {
            $response->getBody()->write(json_encode(['error' => 'Ya existe una nave registrada con el nombre: ' . $data['name']]));
            return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
        }

        $nave = $this->repository->create($data);
        $response->getBody()->write(json_encode($nave));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public function delete(Request $request, Response $response, $args) {
        $id = $args['id'];
        $deleted = $this->repository->delete($id);

        if ($deleted) {
            $response->getBody()->write(json_encode(['message' => 'Nave eliminada']));
        } else {
            $response->getBody()->write(json_encode(['error' => 'No encontrada']));
            return $response->withStatus(404);
        }
        return $response->withHeader('Content-Type', 'application/json');
    }
    
    public function update(Request $request, Response $response, $args) {
        $id = $args['id'];
        $data = json_decode($request->getBody()->getContents(), true);
        $nave = $this->repository->update($id, $data);
        if ($nave) {
            $response->getBody()->write(json_encode(['message' => 'Nave actualizada']));
        } else {
            return $response->withStatus(404);
        }
        return $response->withHeader('Content-Type', 'application/json');
    }
}