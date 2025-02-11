<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;


class RemoveLogsFile extends Command
{
    protected $signature = 'log:remove';

    protected $description = 'Command description';

    public function handle(): void
    {
        $logPath = storage_path('logs');
        $files = File::glob($logPath . '/*.log');
        if (empty($files)) {
            $this->info('nothing to remove');
            return;
        }
        foreach ($files as $file) {
            File::delete($file);
        }
        $this->info('removed log files');
    }
}
