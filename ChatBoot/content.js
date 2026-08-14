window.CHATBOT_NODES = {
  main: {
    type:'question',
    id:'main',
    prompt: 'Hola, soy tu asistente virtual de Recaudación, y estoy para responder tus dudas, deseas iniciar?',
    options:[
      {id:'SI', label:'SI', next:'menuPrincipal'},
      {id:'NO', label:'NO', next:'endNo'}
    ]
  },
  endNo:{ type:'message', id:'endNo', text:'Perfecto. Si necesitas ayuda después, puedes reiniciar el chat.'},

  menuPrincipal:{
    type:'question',
    id:'menuPrincipal',
    prompt: 'ELIGE UNA OPCIÓN',
    options:[
      {id:'SUELDOS_Y_CARTERA', label:'SUELDOS Y CARTERA', next:'sueldo_menu'},
      {id:'INCENTIVOS', label:'INCENTIVOS', next:'incentivos_marca'},
      {id:'PROCESO_COVA', label:'PROCESO_COVA', next:'proceso_cova'},
      {id:'CREDITOS_EXTERNOS', label:'CREDITOS EXTERNOS', next:'creditos_externos'},
      {id:'HABLAR_CON_UN_ASESOR', label:'HABLAR CON UN ASESOR', next:'hablar_asesor'}
    ]
  },

  hablar_asesor:{
    type:'message',
    id:'hablar_asesor',
    text: 'Si deseas hablar con un asesor, haz clic en el enlace de atención. (Abrirá una página externa).',
attachments: [{type:'image', url:'WHATS-removebg-preview.png', link:'https://wa.me/529372547287?text=Hola%2C%20necesito%20apoyo%20del%20%C3%A1rea%20de%20Recaudaci%C3%B3n.%20Vengo%20del%20Asistente%20Abordo.'}]
  },

  sueldo_menu:{
    type:'question',
    id:'sueldo_menu',
    prompt: 'SELECCIONA UNA OPCIÓN',
    options:[
      {id:'FACTOR_PASAJERO', label:'¿Cuánto debo de ingresar para alcanzar Factor Pasajero?', next:'factor_pasajero'},
      {id:'COMO_CALCULO_SUELDO', label:'¿Cómo cálculo mi sueldo?', next:'calcula_sueldo_marca'},
      {id:'QUE_CONCEPTOS', label:'¿Qué conceptos me descuentan en Nómina?', next:'conceptos_nomina'},
      {id:'CUANTO_ISR', label:'¿Cuánto me descuentan  de ISR al mes?', next:'cuanto_isr_marca'},
      {id:'CUANTO_IMSS', label:'¿Cuánto me descuentan  de IMSS al mes?', next:'cuanto_imss_marca'},
      {id:'CUOTA_SINDICAL', label:'¿Cómo se calcula la  Cuota sindical al mes?', next:'cuota_sindical_marca'},
      {id:'DESCUENTO_FONDO', label:'¿Cuánto es el descuento de Fondo de ahorro?', next:'descuento_fondo_marca'},
      {id:'FECHA_FONDO', label:'¿Cuál es la fecha límite para cubrir mi Fondo de Ahorro?', next:'fecha_fondo'},
      {id:'QUE_SON_EXCEDENTES', label:'¿Qué son los excedentes?', next:'excedentes'},
      {id:'CUANTO_IMPUESTOS', label:'¿Cuánto debo de impuestos?', next:'impuestos_link'},
      {id:'REGRESAR', label:'REGRESAR', next:'menuPrincipal'}
    ]
  },

  factor_pasajero:{
    type:'message',
    id:'factor_pasajero',
    text: 'Te invitamos a usar la siguiente aplicación, donde podrás tener el factor mínimo de las corridas donde operas.',
    attachments: [{type:'image', url:'CONSULTA-removebg-preview.png', link:'https://n9.cl/xlctvd'}]
  },

  calcula_sueldo_marca:{
    type:'question',
    id:'calcula_sueldo_marca',
    prompt:'SELECCIONA TU MARCA',
    options:[
      {id:'ADO', label:'ADO', next:'calculo_sueldo_ADO'},
      {id:'TRT', label:'TRT/SUR INTERMEDIO', next:'calculo_sueldo_TRT'},
      {id:'VOLKBUS', label:'VOLKBUS', next:'calculo_sueldo_VOLKBUS'},
      {id:'REGRESAR', label:'REGRESAR', next:'sueldo_menu'}
    ]
  },

  calculo_sueldo_ADO:{
    type:'message',
    id:'calculo_sueldo_ADO',
    text:`Identifica el ingreso total de tu viaje sin IVA y divídelo entre el precio del boleto de tu viaje realizado; el resultado será tu factor pasajero.
Localiza el factor pasajero en la Tabla de pago que te corresponda y toma el factor que se ubica en la columna PK y PP.
Multiplica el factor PK por el kilometraje realizado en tu viaje y obtendrás el pago por kilómetro.
Multiplica el factor PP por el kilometraje realizado en tu viaje y obtendrás el pago por pasajero transportado.
La suma de ambos pagos es el sueldo bruto que percibirás por el viaje realizado antes de impuestos o descuentos de cartera.
Si tienes dudas te invitamos a que visualices el siguiente video:`,
    attachments:[{type:'video', url:'<iframe src="https://player.vimeo.com/video/1104559211?h=15cdc4e413" width="340" height="360" frameborder="0" allowfullscreen></iframe>'}]},

  calculo_sueldo_TRT:{
    type:'message',
    id:'calculo_sueldo_TRT',
    text:`Identifica el ingreso total de tu viaje sin IVA multiplícalo por el 95%; y el resultado divídelo entre el total de kilometros recorridos; esto nos da tu factor ingreso-kilómetro;
Ubica tu FIK en la tabla de pago, entre el rango mínimo,medio y máximo tomando el factor que se ubica en las columnas PK y PP;
Multiplica el factor de la columna PK por el total de kilómetros y esto nos dará el pago por kilometraje;
Multiplica el factor de la columna PP por el total de kilómetros y esto nos dará el pago por pasajero transportado;
La suma de ambos pagos es considerado como tu sueldo bruto antes de impuestos u otros descuentos de cartera.
Si tienes dudas te invitamos a que visualices el siguiente video:`,
    attachments:[{type:'video', url:'<iframe src="https://player.vimeo.com/video/1104559136?h=bfe7ba53ad" width="340" height="360" frameborder="0" allowfullscreen></iframe>'}]},

  calculo_sueldo_VOLKBUS:{
    type:'message',
    id:'calculo_sueldo_VOLKBUS',
    text:`Debes de tener en cuenta que tu cálculo se genera de manera semanal tomando el corte de LUNES a DOMINGO; Identifica el total de tus ingresos de tus secuencias realizadas por día y divídelo entre el total de tus kilómetros recorridos; esto nos dará el factor INGRESO-KILOMETRO: FIK; Ubica tu FIK en la tabla de pago, entre el rango mínimo, medio y superior toma el factor de la columna total y multiplícalo por los kilómetros  recorridos; el resultado será tu comisión diaria; El proceso se repite por cada uno de los días de la semana laborados para así obtener tu comisión semanal antes de impuestos u otros descuentos de cartera; Recuerda que tienes un sueldo de garantía el cual se te pagará en caso de no haber obtenido factor. Si tienes dudas te invitamos a que visualices el siguiente video: `,
    attachments:[{type:'video', url:'<iframe src="https://player.vimeo.com/video/1104558946?h=5c22c1a9b4" width="340" height="360" frameborder="0" allowfullscreen></iframe>'}]},


  conceptos_nomina:{ type:'message', id:'conceptos_nomina', text:'IMSS, ISR, INFONAVIT, Anticipo de Sueldo, Gastos no comprobados, Pistas no comprobadas, Uniformes, Fonacot, Paga Daños e Inspección.'},

  cuanto_isr_marca:{
    type:'question',
    id:'cuanto_isr_marca',
    prompt:'SELECCIONA TU MARCA',
    options:[
      {id:'ADO', label:'ADO', next:'isr_ADO'},
      {id:'TRT', label:'TRT/SUR INTERMEDIO', next:'isr_TRT'},
      {id:'VOLKBUS', label:'VOLKBUS', next:'isr_VOLKBUS'},
      {id:'REGRESAR', label:'REGRESAR', next:'sueldo_menu'}
    ]
  },
  isr_ADO:{ type:'message', id:'isr_ADO', text:'Por 28 días $2,463.85, Por 30 días $2,639.84, por 31 días $2,727.83.'},
  isr_TRT:{ type:'message', id:'isr_TRT', text:'Por 28 días $1,732.06, Por 30 días $1,855.78, por 31 días $1,917.64.'},
  isr_VOLKBUS:{ type:'message', id:'isr_VOLKBUS', text:'Tú perteneces al régimen General de Ley, por lo tanto tus impuestos, van en función a tus percepciones brutas.'},

  cuanto_imss_marca:{
    type:'question',
    id:'cuanto_imss_marca',
    prompt:'SELECCIONA TU MARCA',
    options:[
      {id:'ADO', label:'ADO', next:'imss_ADO'},
      {id:'TRT', label:'TRT/SUR INTERMEDIO', next:'imss_TRT'},
      {id:'VOLKBUS', label:'VOLKBUS', next:'imss_VOLKBUS'},
      {id:'REGRESAR', label:'REGRESAR', next:'sueldo_menu'}
    ]
  },
  imss_ADO:{ type:'message', id:'imss_ADO', text:'Por 28 días $873.61, Por 30 días $936.01, por 31 días $967.21.'},
  imss_TRT:{ type:'message', id:'imss_TRT', text:'Por 28 días $602.85, Por 30 días $645.91, por 31 días $667.44.'},
  imss_VOLKBUS:{ type:'message', id:'imss_VOLKBUS', text:'Tu perteneces al régimen General de Ley, por lo tanto tus impuestos, van en función a tus percepciones brutas.'},

  cuota_sindical_marca:{
    type:'question',
    id:'cuota_sindical_marca',
    prompt:'SELECCIONA TU MARCA',
    options:[
      {id:'ADO', label:'ADO', next:'cuota_ADO'},
      {id:'TRT', label:'TRT/SUR INTERMEDIO', next:'cuota_TRT'},
      {id:'VOLKBUS', label:'VOLKBUS', next:'cuota_VOLKBUS'},
      {id:'REGRESAR', label:'REGRESAR', next:'sueldo_menu'}
    ]
  },
  cuota_ADO:{ type:'message', id:'cuota_ADO', text:'Se multiplica $11.50 por todos los días trabajados del mes inmediato anterior.'},
  cuota_TRT:{ type:'message', id:'cuota_TRT', text:'Se descuenta el 2% sobre tu percepción del viaje realizado.'},
  cuota_VOLKBUS:{ type:'message', id:'cuota_VOLKBUS', text:'Se descuenta el 2% sobre tu percepción de los  viajes realizados. '},

  descuento_fondo_marca:{
    type:'question',
    id:'descuento_fondo_marca',
    prompt:'SELECCIONA TU MARCA',
    options:[
      {id:'ADO', label:'ADO', next:'fondo_ADO'},
      {id:'SUR', label:'SUR INTERMEDIO', next:'fondo_SUR'},
      {id:'TRT_INTERMEDI', label:'TRT INTERMEDIO', next:'fondo_TRT_INTERMEDI'},
      {id:'VOLKBUS', label:'VOLKBUS', next:'fondo_VOLKBUS'},
      {id:'REGRESAR', label:'REGRESAR', next:'sueldo_menu'}
    ]
  },
  fondo_ADO:{ type:'message', id:'fondo_ADO', text:'$1,587.78 mensual'},
  fondo_SUR:{ type:'message', id:'fondo_SUR', text:'$1,013.64 mensual'},
  fondo_TRT_INTERMEDI:{ type:'message', id:'fondo_TRT_INTERMEDI', text:'$1,013.64 mensual'},
  fondo_VOLKBUS:{ type:'message', id:'fondo_VOLKBUS', text:'Tu contrato colectivo no cuenta con esta prestación'},

  fecha_fondo:{ type:'message', id:'fecha_fondo', text:'Tienes hasta el último día del mes, siempre y cuando hayas cubierto tu deuda de cartera (IMSS,ISR,INFONAVIT,PAGO x DAÑOS).'},

  excedentes:{ type:'message', id:'excedentes', text:'Son los montos de impuestos que no alcanzaste a cubrir dentro del mes (ISR, IMSS e INFONAVIT).'},

  impuestos_link:{
    type:'message',
    id:'impuestos_link',
    text:'Para una mejor administración de tus finanzas te invito a consultar el siguiente Link de App Saldos por conductor.',
    attachments:[{type:'image', url:'SALDOS-removebg-preview.png', link:'https://n9.cl/31e71t'}]
  },

  incentivos_marca:{
    type:'question',
    id:'incentivos_marca',
    prompt:'SELECCIONA TU MARCA',
    options:[
      {id:'INC_ADO', label:'ADO', next:'incentivos_ADO'},
      {id:'INC_TRT', label:'TRT/SUR INTERMEDIO', next:'incentivos_TRT'},
      {id:'INC_VOLKBUS', label:'VOLKBUS', next:'incentivos_VOLKBUS'},
      {id:'REGRESAR', label:'REGRESAR', next:'menuPrincipal'}
    ]
  },

  incentivos_ADO:{
    type:'question',
    id:'incentivos_ADO',
    prompt:'ESTOS SON LOS DIFERENTES INCENTIVOS QUE RECIBES, SELECCIONA ALGUNO PARA SABER MAS',
    options:[
      {id:'ICO', label:'ICO', next:'ico_msg'},
      {id:'INS', label:'INS', next:'ins_msg'},
      {id:'REGRESAR', label:'REGRESAR', next:'incentivos_marca'}
    ]
  },
  ico_msg:{ type:'message', id:'ico_msg', text:'Es el Incentivo por Cumplimiento Operativo.  Aplica para los conductores que hayan trabajado durante todo el mes de acuerdo a su contrato colectivo sin registrar ninguna incidencia como por ejemplo: falta, permiso, curso de reforzamiento, baja, suspensión, incapacidad; se paga de manera mensual  a partir del día 15 de cada mes.   '},
  ins_msg:{ type:'message', id:'ins_msg', text:'Es el Incentivo por No Siniestralidad. Su pago se genera en dos tipos: 1.- Cuatrimestral, de ENERO-ABRIL; MAYO-AGOSTO; SEPTIEMBRE-DICIEMBRE el cual se paga tres veces al año a partir del día 18 del mes inmediato de cada cuatrimestre; 2.- El anual, se gana al haber obtenido los tres pagos cuatrimestrales; se determina del 1 de septiembre al 31 de agosto del año siguiente y su pago se realiza a partir del día 18 de octubre. Para obtener este incentivo  recuerda cumplir con el 65% o más del kilometraje programado por región, marca y zona y no tener accidente con responsabilidad. '},

  incentivos_TRT:{
    type:'question',
    id:'incentivos_TRT',
    prompt:'ESTOS SON LOS DIFERENTES INCENTIVOS QUE RECIBES, SELECCIONA ALGUNO PARA SABER MAS',
    options:[
      {id:'IBECC', label:'IBECC', next:'ibecc_msg'},
      {id:'ICO', label:'ICO', next:'ico_msg'},
      {id:'INS', label:'INS', next:'ins_msg'},
      {id:'REGRESAR', label:'REGRESAR', next:'incentivos_marca'}
    ]
  },
  ibecc_msg:{ type:'message', id:'ibecc_msg', text:'Es el Incentivo por Boleto Efectivo Cortado en Camino. Su cálculo es del día 1 al 30 de cada mes  y su pago se realiza a partir del dia 5 del siguiente mes; Aplica para conductor de intermedio sin ayudante y se determina por la venta a bordo realizada, Puedes obtenerlo siempre y cuando no tengas ningún reporte de INSPECCIÓN ni anomalías de AVA.'},
  incentivos_VOLKBUS:{ type:'message', id:'incentivos_VOLKBUS', text:'Tu contrato colectivo no cuenta con un esquema de incentivos.'},

  proceso_cova:{
    type:'question',
    id:'proceso_cova',
    prompt:'PROCESO COVA',
    options:[
      {id:'ACCIDENTE_SIIAB', label:'¿Qué hacer en caso de accidente o falla siiab?', next:'accidente_siiab'},
      {id:'NO_REPORTE_FIN_TURNO', label:'¿Qué hago si la SIIAB no me dió el reporte y el fin de turno ?', next:'no_reporte_fin_turno'},
      {id:'MAQUINA_FALLO', label:'¿Qué debo hacer si la máquina SIIAB falló y emitió boletos de más?', next:'maquina_fallo'},
      {id:'DATOS_TARJETA_INCORRECTOS', label:'¿Qué hago si los datos de mi tarjeta de viaje no están correctos? ', next:'datos_tarjeta'},
      {id:'REQUISITOS_LIQUIDAR', label:'¿Qué requisitos debo tener para liquidar mi viaje en Recaudación?', next:'requisitos_liquidar'},
      {id:'TERMINALES_AUTORIZADAS', label:'¿Cuáles son las terminales autorizadas para realizar depósitos en camino?', next:'terminales_autorizadas'},
      {id:'COMPROBANTE_LIQUIDACION', label:'¿Cuál es mi comprobante de liquidación?', next:'comprobante_liquidacion'},
      {id:'REGRESAR', label:'REGRESAR', next:'menuPrincipal'}
    ]
  },

  accidente_siiab:{ type:'message', id:'accidente_siiab', text:'Repórtalo al 55-32-24-13-21 o bien haz click en el siguiente boton.', attachments:[{type:'link', title:'🚌 CONTIGO EN CAMINO 📞', url:'CONTIGOENELCAMINO.pdf'}]},
  no_reporte_fin_turno:{ type:'message', id:'no_reporte_fin_turno', text:'Repórtalo con tráfico y solicita un detallado de tu venta en el área de Recaudación.'},
  maquina_fallo:{ type:'message', id:'maquina_fallo', text:'Levanta un reporte en el área de mantenimiento y solicita un pase de aclaración por cancelación con tu preceptor y recaba firma del Gerente de Operaciones.'},
  datos_tarjeta:{ type:'message', id:'datos_tarjeta', text:'No la aceptes y pide en ese momento una nueva tarjeta con los controladores de tráfico.'},
  requisitos_liquidar:{ type:'message', id:'requisitos_liquidar', text:'Tarjeta de viaje confirmada por tráfico, efectivo, boletos de canjes, depósitos en camino y gastos autorizados.', attachments:[{type:'video', url:'<iframe src="https://player.vimeo.com/video/1104559098?h=575d0fcf42" width="340" height="360" frameborder="0" allowfullscreen></iframe>'}]},

  terminales_autorizadas:{ type:'message', id:'terminales_autorizadas', text:'Recaudación Cárdenas, Terminal Coatzacoalcos, Terminal La Venta, Terminal Cárdenas, Catab, Terminal Emiliano Zapata, Terminal Tenosique, Terminal Ciudad del Carmen, Recaudación Tuxtla, Terminal Tuxtla, Terminal Mérida.'},
  comprobante_liquidacion:{ type:'message', id:'comprobante_liquidacion', text:'Al término de tu liquidación; siempre que no debas AVA o abones a tu deuda, el área de Recaudación te emitirá un PASE DE NO ADEUDO.'},

  creditos_externos:{
    type:'question',
    id:'creditos_externos',
    prompt:'SELECCIONA EL TIPO DE CREDITO',
    options:[
      {id:'INFONAVIT', label:'INFONAVIT', next:'infonavit'},
      {id:'FONACOT', label:'FONACOT', next:'fonacot'},
      {id:'REGRESAR', label:'REGRESAR', next:'menuPrincipal'}
    ]
  },

  infonavit:{
    type:'question',
    id:'infonavit',
    prompt:'INFONAVIT',
    options:[
      {id:'REQ_INFONAVIT', label:'¿Cuáles son los requisitos para obtener un crédito de Infonavit?', next:'req_infonavit'},
      {id:'AVISO_RETENCION', label:'Cómo puedo obtener mi aviso de retención y/o actualización de factor de descuento?', next:'aviso_infonavit'},
      {id:'REGRESAR', label:'REGRESAR', next:'creditos_externos'}
    ]
  },
  req_infonavit:{ type:'message', id:'accidente_siiab', text:' Accede al siguiente enlace para conocer todos los requisitos que necesitas cumplir para obtener tu crédito INFONAVIT y descubre lo sencillo que es:', attachments:[{type:'link', title:'🏠 REQUISITOS INFONAVIT', url:'Requisitos_y_documentos_Comprar.pdf'}]},
  aviso_infonavit:{ type:'message', id:'aviso_infonavit', text:'Desde el portal "Mi cuenta Infonavit" en la opción -Micrédito - Aviso de suspensión, Retención y Modificación de descuento', attachments:[{type:'video', url:'<iframe src="https://player.vimeo.com/video/1104559004?h=d3bfd28b15" width="340" height="360" frameborder="0" allowfullscreen></iframe>'}]},

  fonacot:{
    type:'question',
    id:'fonacot',
    prompt:'FONACOT',
    options:[
      {id:'REQ_FONACOT', label:'¿Cuáles son los requisitos para obtener un crédito Fonacot?', next:'req_fonacot'},
      {id:'CONST_PERCEPCIONES', label:'¿Cómo puedo obtener una constancia de percepciones?', next:'constancia_percepciones'},
      {id:'REGRESAR', label:'REGRESAR', next:'creditos_externos'}
    ]
  },
  req_fonacot:{ type:'message', id:'accidente_siiab', text:' Accede al siguiente enlace para conocer todos los requisitos que necesitas cumplir para obtener tu crédito FONACOT y descubre lo sencillo que es agendar tu cita de manera rápida y segura:', attachments:[{type:'link', title:'💲 💰 REQUISITOS FONACOT', url:'REQFONACOT.pdf'}]},
  constancia_percepciones:{ type:'message', id:'constancia_percepciones', text:'Acude al área de Relaciones industriales de RH para que puedan extenderte dicho documento.'},

};
