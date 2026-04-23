<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;
use App\Models\BackupSetting;
use App\Models\AiSetting;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user        = $request->user();
        $backupSettings = BackupSetting::firstOrCreate(
            ['user_id' => $user->id],
            ['schedule' => 'manual', 'backup_time' => '02:00', 'max_backups' => 30]
        );
        $aiSetting = AiSetting::where('user_id', $user->id)->first();

        return Inertia::render('Settings/Index', [
            'user'           => $user,
            'backupSettings' => $backupSettings,
            'aiSetting'      => $aiSetting ? [
                'provider'        => $aiSetting->provider,
                'model'           => $aiSetting->model,
                'custom_endpoint' => $aiSetting->custom_endpoint,
                'is_enabled'      => $aiSetting->is_enabled,
                'has_key'         => !empty($aiSetting->getRawOriginal('api_key')),
            ] : null,
        ]);
    }

    public function toggleDarkMode(Request $request)
    {
        $user = $request->user();
        $user->update(['dark_mode' => !$user->dark_mode]);
        return response()->json(['dark_mode' => $user->dark_mode]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'name'          => ['required', 'string', 'max:100'],
            'business_name' => ['nullable', 'string', 'max:100'],
            'phone'         => ['nullable', 'string', 'max:20'],
            'currency'      => ['nullable', 'string', 'max:10'],
            'timezone'      => ['nullable', 'string', 'max:50'],
        ]);
        $user->update($data);
        return back()->with('success', 'Profile updated.');
    }

    public function updatePhoto(Request $request)
    {
        $request->validate(['photo' => ['required', 'image', 'max:5120']]);
        $user = $request->user();

        if ($user->profile_photo) {
            Storage::disk('public')->delete($user->profile_photo);
        }

        $filename = 'profiles/' . uniqid() . '.jpg';
        $image    = Image::read($request->file('photo'))->cover(400, 400);
        Storage::disk('public')->put($filename, $image->toJpeg(85));

        $user->update(['profile_photo' => $filename]);
        return back()->with('success', 'Profile photo updated.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ]);
        $request->user()->update(['password' => Hash::make($request->password)]);
        return back()->with('success', 'Password changed successfully.');
    }

    public function updatePin(Request $request)
    {
        $request->validate(['pin' => ['required', 'digits:4']]);
        $request->user()->update(['pin_code' => Hash::make($request->pin)]);
        return back()->with('success', 'PIN updated.');
    }
}
