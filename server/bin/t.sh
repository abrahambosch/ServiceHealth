curl  http://localhost:3001/sshCommand \
-X POST \
-H 'Content-Type: application/json' \
-d '{"groupName":"ANA","hostName":"testhost","serviceName":"Wisp Core","commandName":"Status","command":"/opt/admin/jenkins/bin/apache_status"}'