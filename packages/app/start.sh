# #!/bin/sh
# npm start
nginx -t

echo 'start.sh '
nginx  & \
npm start & \
wait 

echo 'after'


# # #!/bin/sh
# nginx -t && \
# echo 'start.sh ' && \
# nginx && \
# npm start && \
# echo 'after'