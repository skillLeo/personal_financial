<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Category::where('user_id', $request->user()->id);
        if ($request->filled('type')) $query->where('type', $request->type);
        return $this->success($query->orderBy('name')->get()->map(fn($c) => $this->fmt($c)));
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name'  => ['required', 'string', 'max:100'],
            'type'  => ['required', 'in:income,expense,both'],
            'color' => ['nullable', 'string', 'max:10'],
            'icon'  => ['nullable', 'string', 'max:50'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $category = Category::create([
            ...$request->only(['name', 'type', 'color', 'icon']),
            'user_id'   => $request->user()->id,
            'is_system' => false,
        ]);
        return $this->created($this->fmt($category));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::where('user_id', $request->user()->id)->find($id);
        if (!$category) return $this->notFound('Category not found.');

        $v = Validator::make($request->all(), [
            'name'  => ['sometimes', 'string', 'max:100'],
            'type'  => ['sometimes', 'in:income,expense,both'],
            'color' => ['nullable', 'string', 'max:10'],
            'icon'  => ['nullable', 'string', 'max:50'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $category->update($request->only(['name', 'type', 'color', 'icon']));
        return $this->success($this->fmt($category->fresh()), 'Category updated.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $category = Category::where('user_id', $request->user()->id)->find($id);
        if (!$category) return $this->notFound('Category not found.');
        if ($category->is_system) return $this->error('System categories cannot be deleted.', 422);

        $category->delete();
        return $this->success(null, 'Category deleted.');
    }

    private function fmt(Category $c): array
    {
        return ['id' => $c->id, 'name' => $c->name, 'type' => $c->type, 'color' => $c->color, 'icon' => $c->icon, 'is_system' => (bool) $c->is_system];
    }
}
