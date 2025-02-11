<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ClearLogs extends Command
{
    protected $signature = 'logs:clear {--file=}';

    protected $description = 'Clear logs from storage/logs';

    public function handle(): void
    {
        $file = $this->option('file');
        if (!$file) {
            $this->error('please add --file=filename.log');
        } else {
            if ($file === 'all') {
                $files = scandir(storage_path('logs'));
                foreach ($files as $key=>$file) {
                    if ($file === '.' || $file === '..') {
                        continue;
                    }
                    $logPath = storage_path("logs/$file");
                    if (file_exists($logPath) && $file !== '.gitignore') {
                        file_put_contents($logPath, '');
                        $this->info("file No.$key >> ".'Logs have been cleared! File: ' . $file);
                    } else {
                        $this->error("file NO.$key >> No logs to clear!");
                    }
                }
            } else {
                $logPath = storage_path("logs/$file");
                if (file_exists($logPath)) {
                    file_put_contents($logPath, '');
                    $this->info('Logs have been cleared! File: ' . $file);
                } else {
                    $this->error('No logs to clear!'.$file);
                }
            }
        }
    }
}
