<?php

namespace App\Models\Traits;

use App\Models\Scopes\UserScope;

trait HasUserScope
{
    protected static function bootHasUserScope(): void
    {
        static::addGlobalScope(new UserScope());
    }
}
