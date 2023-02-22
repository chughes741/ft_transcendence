#------------------------------------------------------------------------------#
#                                  GENERICS                                    #
#------------------------------------------------------------------------------#

# Special variables
DEFAULT_GOAL: all
.DELETE_ON_ERROR:
.PHONY: build up down clean fclean re

# Set to -q to silence docker output
QUIET = 

#------------------------------------------------------------------------------#
#                                VARIABLES                                     #
#------------------------------------------------------------------------------#

NAME	=	ft_transcendence
COMPOSE	=	docker-compose.yml

#------------------------------------------------------------------------------#
#                                 TARGETS                                      #
#------------------------------------------------------------------------------#

# Build or rebuild services
#	docker compose build [OPTIONS] [SERVICE...]
build:
	docker compose build $(QUIET)

# Builds, (re)creates, starts, and attaches to containers for a service.
#	docker compose up [OPTIONS] [SERVICE...]
up:
	docker compose up --build

# Stop and remove containers, networks
#	docker compose create [OPTIONS] [SERVICE...]
down:
	docker compose down

# Remove all unused containers, networks, images (both dangling and unreferenced), and optionally, volumes.
#	docker system prune [OPTIONS]
clean:
	docker system prune -f

fclean:
	docker system prune -f --volumes

re: fclean up
