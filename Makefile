#------------------------------------------------------------------------------#
#                                  GENERICS                                    #
#------------------------------------------------------------------------------#

# Special variables
DEFAULT_GOAL: up
.PHONY: build up down clean fclean re


#------------------------------------------------------------------------------#
#                                 TARGETS                                      #
#------------------------------------------------------------------------------#

# Build or rebuild services
#	docker compose build [OPTIONS] [SERVICE...]
build:
	docker compose build

# Builds, (re)creates, starts, and attaches to containers for a service.
#	docker compose up [OPTIONS] [SERVICE...]
up:
	docker compose up --build -d

# Stop and remove containers, networks
#	docker compose create [OPTIONS] [SERVICE...]
down:
	docker compose down

# Remove all unused containers, networks, images (both dangling and unreferenced), and optionally, volumes.
#	docker system prune [OPTIONS]
clean:
	docker system prune -f --volumes

# Remove all dangling images
prune:
	docker image prune -f

# Runs frontend and backend locally
run-local:
	yarn --cwd app start
