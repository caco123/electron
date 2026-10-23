!macro customInstall
  DetailPrint "Configurando instalaciones independientes para Admin y User..."

  ; 1. Crear staging temporal en $PLUGINSDIR para no interferir con la copia
  CreateDirectory "$PLUGINSDIR\staging"
  CopyFiles /SILENT "$INSTDIR\*.*" "$PLUGINSDIR\staging"

  ; 2. Crear instalacion independiente para Administrador
  DetailPrint "Instalando componentes de rol Administrador..."
  CreateDirectory "$INSTDIR\Admin"
  CopyFiles /SILENT "$PLUGINSDIR\staging\*.*" "$INSTDIR\Admin"
  Rename "$INSTDIR\Admin\${APP_EXECUTABLE_FILENAME}" "$INSTDIR\Admin\MiAplicacion Admin.exe"
  Delete "$INSTDIR\Admin\Uninstall*.exe"

  ; Generar identificador de rol para Administrador
  FileOpen $0 "$INSTDIR\Admin\role.json" w
  FileWrite $0 '{"role":"admin"}'
  FileClose $0

  ; 3. Crear instalacion independiente para Usuario
  DetailPrint "Instalando componentes de rol Usuario..."
  CreateDirectory "$INSTDIR\User"
  CopyFiles /SILENT "$PLUGINSDIR\staging\*.*" "$INSTDIR\User"
  Rename "$INSTDIR\User\${APP_EXECUTABLE_FILENAME}" "$INSTDIR\User\MiAplicacion User.exe"
  Delete "$INSTDIR\User\Uninstall*.exe"

  ; Generar identificador de rol para Usuario
  FileOpen $0 "$INSTDIR\User\role.json" w
  FileWrite $0 '{"role":"user"}'
  FileClose $0

  ; 4. Limpiar archivos base de la raiz para mantener solo el desinstalador y las 2 carpetas
  RMDir /r "$INSTDIR\locales"
  RMDir /r "$INSTDIR\resources"
  Delete "$INSTDIR\*.pak"
  Delete "$INSTDIR\*.dll"
  Delete "$INSTDIR\*.bin"
  Delete "$INSTDIR\*.dat"
  Delete "$INSTDIR\*.json"
  Delete "$INSTDIR\LICENSE*"
  Delete "$INSTDIR\version"
  Delete "$INSTDIR\${APP_EXECUTABLE_FILENAME}"

  ; Limpiar staging
  RMDir /r "$PLUGINSDIR\staging"

  ; 5. Crear accesos directos diferenciados para cada rol
  CreateShortCut "$DESKTOP\MiAplicacion Admin.lnk" "$INSTDIR\Admin\MiAplicacion Admin.exe" "--role=admin" "$INSTDIR\Admin\MiAplicacion Admin.exe" 0 "" "" "Ejecutar MiAplicacion en modo Administrador"
  CreateShortCut "$SMPROGRAMS\MiAplicacion Admin.lnk" "$INSTDIR\Admin\MiAplicacion Admin.exe" "--role=admin" "$INSTDIR\Admin\MiAplicacion Admin.exe" 0 "" "" "Ejecutar MiAplicacion en modo Administrador"

  CreateShortCut "$DESKTOP\MiAplicacion User.lnk" "$INSTDIR\User\MiAplicacion User.exe" "--role=user" "$INSTDIR\User\MiAplicacion User.exe" 0 "" "" "Ejecutar MiAplicacion en modo Usuario"
  CreateShortCut "$SMPROGRAMS\MiAplicacion User.lnk" "$INSTDIR\User\MiAplicacion User.exe" "--role=user" "$INSTDIR\User\MiAplicacion User.exe" 0 "" "" "Ejecutar MiAplicacion en modo Usuario"

  ; 6. Actualizar enlace de ejecucion de final de asistente
  StrCpy $launchLink "$INSTDIR\Admin\MiAplicacion Admin.exe"
!macroend

!macro customUnInstall
  DetailPrint "Eliminando carpetas de instalaciones independientes..."
  RMDir /r "$INSTDIR\Admin"
  RMDir /r "$INSTDIR\User"

  DetailPrint "Eliminando accesos directos de roles..."
  Delete "$DESKTOP\MiAplicacion Admin.lnk"
  Delete "$DESKTOP\MiAplicacion User.lnk"
  Delete "$SMPROGRAMS\MiAplicacion Admin.lnk"
  Delete "$SMPROGRAMS\MiAplicacion User.lnk"
!macroend
