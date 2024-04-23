FROM ubuntu:latest
#FROM httpd:2.4

RUN apt update && apt install  openssh-server sudo -y

RUN useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u 1000 jenkins

RUN  echo 'jenkins:jenkins' | chpasswd

RUN service ssh start

apt-get install apache2 -y


EXPOSE 22
EXPOSE 80

RUN mkdir -p /opt/admin/jenkins/bin
RUN chown -R jenkins:root /opt/admin/jenkins

CMD ["/usr/sbin/sshd","-D"]
