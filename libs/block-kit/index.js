const imgUrl = 'https://swm-chatbot-46uclz-yobetp.run.goorm.io/request/img';
const resIO = require('../resIO');
const play = require('../play');
const suffix = ' (SOMA 2033)'

getImageUrl = (imgName) => {
	return imgUrl + '?name=' + imgName;
};
getStatusBar = (a, b, c) => {
	txt = '';
	if (a == 0) txt += 'π';
	for (i = 0; i < a; i++) txt += 'β€οΈ';
	txt += ' | ';
	if (b == 0) txt += 'π΅';
	for (i = 0; i < b; i++) txt += 'π‘';
	txt += ' | ';
	if (c == 0) txt += 'β';
	for (i = 0; i < c; i++) txt += 'π°';
	return {
		type: 'text',
		text: txt,
		markdown: true,
	};
};

// μ€ν λ¦¬ λΈλ‘ν·μ λκ²¨μ€λλ€.
exports.storyBlock = (conversation_id, user_json, story_json, story_id) => {
	const state_dict = play.statesList2dict(user_json.states);
	// text length 500 limitation
	if (story_json.body.length > 500) {
		console.log({ story_id: story_id, errorMsg: 'body length 500 exceeded' });
		story_json.body = story_json.body.slice(0, 500);
	}
	const ret_object = {
		conversationId: conversation_id,
		text: 'μλ‘μ΄ μ΄μΌκΈ°κ° λμ°©νμ΄μ!' + suffix,
		blocks: [
			{
				type: 'header',
				text: 'SOMA 2033',
				style: 'blue',
			},
			getStatusBar(
				state_dict["health"],
				state_dict["wifi"],
				state_dict["coin"]
			),
			{
				type: 'text',
				text: story_json.body,
				markdown: true,
			},
			{
				type: 'divider',
			},
		],
	};
	if (story_json.picture) {
		imgBlock = {
			type: 'image_link',
			url: getImageUrl(story_json.picture),
		};
		ret_object.blocks.splice(2, 0, imgBlock);
	}
	var cnt = -1;
	for (const option of story_json.options) {
		cnt++;
		var flag = 0;
		const option_condition_dict = play.statesList2dict(option.option_condition);
		for (const op of Object.keys(option_condition_dict)) {
			if (!Object.keys(state_dict).includes(op)) {
				flag = 1;
				break;
			}
			
			if (state_dict[op] < option_condition_dict[op]) {
				flag = 1;
				break;
			}
		}
		if (flag) continue;
		// Button string length 20 limitation
		if (option.option_text.length > 20) {
			console.log({
				story_id: story_id,
				option_text: option.option_text,
				errorMsg: 'btn  option length 20 exceeded',
			});
			option.option_text = option.option_text.slice(0, 20);
		}
		ret_object.blocks.push({
			type: 'button',
			text: option.option_text,
			action_type: 'submit_action',
			action_name: 'AcTioN nAmE',
			value: story_id + '_' + String(cnt),
			style: 'default',
		});
	}
	return ret_object;
};
exports.rankingBlock = (conversation_id, ranking) => {
	// text length 500 limitation
	txt = ''
	for(i in ranking){
		txt += String(parseInt(i) + 1)  + "μ. " + ranking[i][0] + ": μμ  " + ranking[i][1] + "κ° λ¬μ±" + '\n';
	}
	txt += 'λ­νΉμ λ¬μ±ν μμ  κ°μ μμΌλ‘ κ²°μ λ©λλ€.'
	if (txt.length > 500) {
		console.log({ txt: txt, errorMsg: 'body length 500 exceeded' });
		txt = txt.slice(0, 500);
	}
	const ret_object = {
		conversationId: conversation_id,
		text: 'λ­νΉ νμΈ!' + suffix,
		blocks: [
			{
				type: 'header',
				text: 'SOMA 2033 λ­νΉ',
				style: 'orange',
			},
			{
				type: 'text',
				text: txt,
				markdown: true,
			},
			{
				type: 'divider',
			},
		],
	};
	return ret_object;
};

exports.showUpdatedStatesAndAchieve = (
	conversation_id,
	added_states,
	deleted_states,
	achieve,
	stateInfos,
	achieveInfos
) => {
	const blocks = [];
	var states_exist = false;

	const added_states_dict = play.statesList2dict(added_states);
	const deleted_states_dict = play.statesList2dict(deleted_states);

	for (state of Object.keys(added_states_dict)) {
		if (
			stateInfos[state] == undefined ||
			stateInfos[state] == null ||
			stateInfos[state] == ''
		) {
			delete added_states_dict[state];
		}
	}

	for (state of Object.keys(deleted_states_dict)) {
		if (
			stateInfos[state] == undefined ||
			stateInfos[state] == null ||
			stateInfos[state] == ''
		) {
			delete deleted_states_dict[state];
		}
	}

	if (Object.keys(added_states_dict).length + Object.keys(deleted_states_dict).length > 0)
		states_exist = true;

	if (achieve != '') {
		blocks.push({
			type: 'text',
			text: `*β μμ  νλ β*`,
			markdown: true,
		});

		blocks.push({
			type: 'text',
			text: `- "${achieveInfos[achieve]}" μμ μ νλνμμ΅λλ€!`,
			markdown: true,
		});

		if (states_exist) {
			blocks.push({
				type: 'divider',
			});
		}
	}

	if (states_exist) {
		blocks.push({
			type: 'text',
			text: `*β μν λ³κ²½ β*`,
			markdown: true,
		});

		for (const st of Object.keys(deleted_states_dict)) {
			blocks.push({
				type: 'text',
				text: `- ${stateInfos[st]} ${deleted_states_dict[st]}κ° μμμ΅λλ€.`,
				markdown: true,
			});
		}

		for (const st of Object.keys(added_states_dict)) {
			blocks.push({
				type: 'text',
				text: `- ${stateInfos[st]} ${added_states_dict[st]}κ° μ»μμ΅λλ€.`,
				markdown: true,
			});
		}
	}

	if (blocks.length > 0) {
		blocks.push({
			type: 'button',
			text: 'μμ /μν νμΈνκΈ°',
			action_type: 'call_modal',
			action_name: 'AcTioN nAmE',
			value: 'getUserInfo',
			style: 'default',
		});
	}

	ret_object = {
		conversationId: conversation_id,
		text: 'μν/μμ μ΄ λ³κ²½λμμ΄μ!' + suffix,
		blocks: blocks,
	};

	return ret_object;
};

exports.userInfoBlock = (user_json, states, achieves) => {
	txt_state = '*[ μν ]*\n';
	for (state of user_json.states) {
		tmp = state.split('_');
		state = states[tmp[0]];
		if (state != undefined && state != null && state != '') {
			tmp[0] = tmp[0].split('-')[0];
			if(tmp[0] == 'team' || tmp[0] == 'mentor' || tmp[0] == 'main')
				txt_state += ' - ' + state + '\n';
			else
				txt_state += ' - ' + state + ' ' + tmp[1] + '\n';
		}
	}
	txt_achieve = '*[ μμ  ]*\n';
	for (achieve of user_json.achieves) {
		achieve = achieves[achieve];
		if (achieve != undefined && achieve != null && achieve != '')
			txt_achieve += ' - ' + achieve + '\n';
	}
	txt_achieve += '\n';
	// text length 200 limitation
	if (txt_state.length > 200) {
		console.log({ txt_state: txt_state, errorMsg: 'length 200 exceeded' });
		txt_state = 'κΈμμ μ΄κ³Όλ‘ μΈν΄ μνλ₯Ό λΆλ¬μ¬ μ μμ΅λλ€.';
	}
	if (txt_achieve.length > 200) {
		console.log({ txt_achieve: txt_achieve, errorMsg: 'length 200 exceeded' });
		txt_achieve = 'κΈμμ μ΄κ³Όλ‘ μΈν΄ μμ μ λΆλ¬μ¬ μ μμ΅λλ€.';
	}
	ret_object = {
		title: 'User Info',
		accept: 'νμΈ',
		decline: 'μ·¨μ',
		value: 'gotUserInfo', // implement if necessary
		blocks: [
			{
				type: 'label',
				text: txt_state,
				markdown: true,
			},
			{
				type: 'label',
				text: txt_achieve,
				markdown: true,
			},
			{
  				type: 'input',
				name: 'restart',
  				required: false,
  				placeholder: 'μ¬μμ'
			},
			{
				type: 'label',
				text: 'μ€λ₯ λ±μΌλ‘ μΈν΄ μ¬μμμ μν  κ²½μ° μμ \"μ¬μμ\"μ μλ ₯νκ³  μλ \"νμΈ\"μ λλ¬μ£ΌμΈμ. μ¬μμν  κ²½μ° μμ μ μ μΈν λͺ¨λ  λ°μ΄ν°κ° μ΄κΈ°νλ©λλ€. μ΄μΈμ κ²½μ° λ€λ‘ κ°κΈ°λ₯Ό λλ¬μ£ΌμΈμ.',
				markdown: true
			}
		],
	};
	return ret_object;
};