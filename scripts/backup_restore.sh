#!/bin/bash

# ============================================================
# Script de Backup y Restauración de Base de Datos
# ============================================================
# Este script proporciona comandos para hacer backup y restaurar
# la base de datos MySQL/TiDB del MVP de Auditoría de Inventarios.
#
# Uso:
#   ./scripts/backup_restore.sh backup
#   ./scripts/backup_restore.sh restore <archivo_dump.sql>
#
# Requisitos:
#   - mysql o mysqldump instalado
#   - Variable de entorno DATABASE_URL configurada
# ============================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para extraer componentes de DATABASE_URL
parse_database_url() {
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}ERROR: DATABASE_URL no está configurada${NC}"
        exit 1
    fi

    # Formato esperado: mysql://user:password@host:port/database
    # Extraer componentes usando regex
    if [[ $DATABASE_URL =~ mysql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASSWORD="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
    else
        echo -e "${RED}ERROR: Formato de DATABASE_URL inválido${NC}"
        echo "Formato esperado: mysql://user:password@host:port/database"
        exit 1
    fi
}

# Función de backup
backup_database() {
    echo -e "${YELLOW}Iniciando backup de la base de datos...${NC}"
    
    parse_database_url
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="backup_${DB_NAME}_${TIMESTAMP}.sql"
    
    echo -e "${GREEN}Conectando a: ${DB_HOST}:${DB_PORT}/${DB_NAME}${NC}"
    
    # Ejecutar mysqldump
    mysqldump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --user="$DB_USER" \
        --password="$DB_PASSWORD" \
        --databases "$DB_NAME" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backup completado exitosamente: ${BACKUP_FILE}${NC}"
        echo -e "${GREEN}  Tamaño: $(du -h "$BACKUP_FILE" | cut -f1)${NC}"
    else
        echo -e "${RED}✗ Error al crear el backup${NC}"
        exit 1
    fi
}

# Función de restauración
restore_database() {
    if [ -z "$1" ]; then
        echo -e "${RED}ERROR: Debe especificar el archivo de backup${NC}"
        echo "Uso: $0 restore <archivo_dump.sql>"
        exit 1
    fi
    
    BACKUP_FILE="$1"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}ERROR: El archivo ${BACKUP_FILE} no existe${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Iniciando restauración de la base de datos...${NC}"
    echo -e "${RED}ADVERTENCIA: Esto sobrescribirá los datos existentes${NC}"
    read -p "¿Está seguro de continuar? (s/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${YELLOW}Restauración cancelada${NC}"
        exit 0
    fi
    
    parse_database_url
    
    echo -e "${GREEN}Conectando a: ${DB_HOST}:${DB_PORT}/${DB_NAME}${NC}"
    
    # Ejecutar mysql para restaurar
    mysql \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --user="$DB_USER" \
        --password="$DB_PASSWORD" \
        < "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Restauración completada exitosamente${NC}"
    else
        echo -e "${RED}✗ Error al restaurar la base de datos${NC}"
        exit 1
    fi
}

# Función de ayuda
show_help() {
    echo "Uso: $0 {backup|restore} [opciones]"
    echo ""
    echo "Comandos:"
    echo "  backup              Crear un backup de la base de datos"
    echo "  restore <archivo>   Restaurar la base de datos desde un archivo"
    echo ""
    echo "Ejemplos:"
    echo "  $0 backup"
    echo "  $0 restore backup_audit_inventory_20251024_120000.sql"
}

# Main
case "$1" in
    backup)
        backup_database
        ;;
    restore)
        restore_database "$2"
        ;;
    *)
        show_help
        exit 1
        ;;
esac

