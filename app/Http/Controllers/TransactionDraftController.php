<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\TransactionDraft;

class TransactionDraftController extends Controller
{
    public function count(Request $request)
    {
        $count = \App\Models\TransactionDraft::where('user_id', $request->user()->id)
            ->pending()->count();
        return response()->json(['count' => $count]);
    }

    public function index(Request $request)
    {
        $drafts = \App\Models\TransactionDraft::where('user_id', $request->user()->id)
            ->pending()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($d) => $this->formatDraft($d));

        return response()->json(['drafts' => $drafts]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'amount'     => ['nullable', 'numeric', 'min:0'],
            'label'      => ['nullable', 'string', 'max:255'],
            'type'       => ['nullable', 'in:income,expense,unknown'],
            'voice_note' => ['nullable', 'file', 'mimes:webm,ogg,mp4,wav,m4a', 'max:10240'],
        ]);

        $draft = new TransactionDraft();
        $draft->user_id = $request->user()->id;
        $draft->amount  = $data['amount'] ?? null;
        $draft->label   = $data['label']  ?? null;
        $draft->type    = $data['type']   ?? 'expense';

        if ($request->hasFile('voice_note')) {
            $path = $request->file('voice_note')->store("voice_notes/{$request->user()->id}", 'local');
            $draft->voice_note_path = $path;
        }

        $draft->save();

        return response()->json([
            'draft'   => $this->formatDraft($draft),
            'message' => 'Draft saved.',
        ]);
    }

    public function discard(TransactionDraft $draft, Request $request)
    {
        abort_unless($draft->user_id === $request->user()->id, 403);

        if ($draft->voice_note_path) {
            Storage::disk('local')->delete($draft->voice_note_path);
        }

        $draft->update(['discarded_at' => now()]);

        return response()->json(['message' => 'Draft discarded.']);
    }

    public function convert(TransactionDraft $draft, Request $request)
    {
        abort_unless($draft->user_id === $request->user()->id, 403);

        $draft->update(['converted_at' => now()]);

        return response()->json(['message' => 'Draft converted.']);
    }

    public function voiceNote(TransactionDraft $draft, Request $request)
    {
        abort_unless($draft->user_id === $request->user()->id, 403);
        abort_unless($draft->voice_note_path, 404);

        $path = storage_path("app/{$draft->voice_note_path}");
        abort_unless(file_exists($path), 404);

        return response()->file($path);
    }

    private function formatDraft(TransactionDraft $draft): array
    {
        return [
            'id'               => $draft->id,
            'amount'           => $draft->amount,
            'label'            => $draft->label,
            'type'             => $draft->type,
            'has_voice_note'   => (bool) $draft->voice_note_path,
            'voice_note_url'   => $draft->voice_note_path ? "/drafts/{$draft->id}/voice" : null,
            'created_at'       => $draft->created_at?->toIso8601String(),
            'converted_at'     => $draft->converted_at?->toIso8601String(),
            'discarded_at'     => $draft->discarded_at?->toIso8601String(),
        ];
    }
}
