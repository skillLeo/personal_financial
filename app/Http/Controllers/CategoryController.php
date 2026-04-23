<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::where('user_id', $request->user()->id)->get();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'  => ['required', 'string', 'max:50'],
            'type'  => ['required', 'in:income,expense,both'],
            'color' => ['nullable', 'string', 'max:10'],
            'icon'  => ['nullable', 'string', 'max:50'],
        ]);
        $data['user_id'] = $request->user()->id;
        $category = Category::create($data);

        if ($request->wantsJson()) {
            return response()->json($category);
        }
        return back()->with('success', 'Category created.');
    }

    public function update(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) abort(403);
        $data = $request->validate([
            'name'  => ['required', 'string', 'max:50'],
            'type'  => ['required', 'in:income,expense,both'],
            'color' => ['nullable', 'string', 'max:10'],
            'icon'  => ['nullable', 'string', 'max:50'],
        ]);
        $category->update($data);

        if ($request->wantsJson()) {
            return response()->json($category);
        }
        return back()->with('success', 'Category updated.');
    }

    public function destroy(Category $category)
    {
        if ($category->user_id !== auth()->id()) abort(403);
        if ($category->is_system) {
            return back()->with('error', 'Cannot delete system categories.');
        }
        $category->delete();
        return back()->with('success', 'Category deleted.');
    }
}
