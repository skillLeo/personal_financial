<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\TransactionDraft;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DraftController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $drafts = TransactionDraft::where('user_id', $request->user()->id)
            ->whereNull('converted_at')->whereNull('discarded_at')
            ->orderByDesc('created_at')->get()->map(fn($d) => $this->fmt($d, $request));
        return $this->success($drafts);
    }

    public function count(Request $request): JsonResponse
    {
        $count = TransactionDraft::where('user_id', $request->user()->id)
            ->whereNull('converted_at')->whereNull('discarded_at')->count();
        return $this->success(['count' => $count]);
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'amount'     => ['nullable', 'numeric', 'min:0'],
            'label'      => ['nullable', 'string', 'max:255'],
            'type'       => ['nullable', 'in:income,expense,unknown'],
            'voice_note' => ['nullable', 'file', 'mimes:webm,ogg,mp4,m4a,wav', 'max:10240'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $data = [...$request->only(['amount', 'label', 'type']), 'user_id' => $request->user()->id];
        if (!$data['type']) $data['type'] = 'unknown';

        if ($request->hasFile('voice_note')) {
            $data['voice_note_path'] = $request->file('voice_note')->store('voice-notes', 'local');
        }

        $draft = TransactionDraft::create($data);
        return $this->created($this->fmt($draft, $request));
    }

    public function convert(Request $request, int $id): JsonResponse
    {
        $draft = TransactionDraft::where('user_id', $request->user()->id)->whereNull('converted_at')->whereNull('discarded_at')->find($id);
        if (!$draft) return $this->notFound('Draft not found.');

        $draft->update(['converted_at' => now()]);
        return $this->success([
            'draft_id' => $draft->id,
            'prefill'  => [
                'amount'      => $draft->amount,
                'description' => $draft->label,
                'type'        => $draft->type === 'unknown' ? 'expense' : $draft->type,
            ],
        ], 'Draft converted. Use prefill data to create the transaction.');
    }

    public function discard(Request $request, int $id): JsonResponse
    {
        $draft = TransactionDraft::where('user_id', $request->user()->id)->whereNull('converted_at')->whereNull('discarded_at')->find($id);
        if (!$draft) return $this->notFound('Draft not found.');

        if ($draft->voice_note_path) Storage::disk('local')->delete($draft->voice_note_path);
        $draft->update(['discarded_at' => now()]);

        return $this->success(null, 'Draft discarded.');
    }

    private function fmt(TransactionDraft $d, Request $request): array
    {
        return [
            'id'              => $d->id,
            'amount'          => $d->amount ? (float) $d->amount : null,
            'label'           => $d->label,
            'type'            => $d->type,
            'has_voice_note'  => !empty($d->voice_note_path),
            'voice_note_url'  => $d->voice_note_path ? url("/api/v1/drafts/{$d->id}/voice") : null,
            'created_at'      => $d->created_at->toIso8601String(),
        ];
    }
}
