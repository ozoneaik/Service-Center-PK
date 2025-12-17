<?php

namespace App\Services;

class SendMessageService
{
    // version 1.0

    // $proxy = 'localhost:7777';
    // $proxy_userpwd = 'username:password';
    public static function sendMessage($account, $password, $mobile_no, $message, $schedule = '', $category = '', $sender_name = '', $proxy = '', $proxy_userpwd = '')
    {
        $option = '';
        if ($category == '') {
            $category = 'General';
        }
        $option = "SEND_TYPE={$category}";
        if ($sender_name != '') {
            $option .= ",SENDER={$sender_name}";
        }

        $params = array(
            'ACCOUNT' => $account,
            'PASSWORD' => $password,
            'MOBILE' => $mobile_no,
            'MESSAGE' => $message
        );
        if ($schedule) {
            $params['SCHEDULE'] = $schedule;
        }
        if ($option) {
            $params['OPTION'] = $option;
        }

        $curl_options = array(
            CURLOPT_URL => 'https://u8-2.sc4msg.com/SendMessage',
            CURLOPT_PORT => 443,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($params),
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSLVERSION => 6,
            CURLOPT_RETURNTRANSFER => true,
        );
        if ($proxy != '') {
            $curl_options[CURLOPT_PROXY] = $proxy;
            if ($proxy_userpwd != '') {
                $curl_options[CURLOPT_PROXYUSERPWD] = $proxy_userpwd;
            }
        }

        $ch = curl_init();
        curl_setopt_array($ch, $curl_options);
        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return array('result' => false, 'error' => $error);
        } else {
            // STATUS=0
            // TASK_ID=109692
            // END=OK
            //echo $response;
            $results = explode("\n", trim($response));
            $index = count($results) - 1;
            if (trim($results[$index]) == 'END=OK') {
                $results[0] = trim($results[0]);
                if ($results[0] == 'STATUS=0') {
                    $task_id = '';
                    $message_id = '';
                    foreach ($results as $result) {
                        $datas = explode("=", $result);
                        if ($datas[0] == 'TASK_ID') {
                            $task_id = $datas[1];
                        } elseif ($datas[0] == 'MESSAGE_ID') {
                            $message_id = $datas[1];
                        }
                    }
                    return array(
                        'result'     => true,
                        'task_id'    => $task_id,
                        'message_id' => $message_id
                    );
                } else {
                    return array(
                        'result' => false,
                        'error'  => $results[0]
                    );
                }
            } else {
                return array(
                    'result' => false,
                    'error'  => "Incorrect Response: {$response}"
                );
            }
        }
    }
}
