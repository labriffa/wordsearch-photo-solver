import React from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Text, Image } from 'react-native';
import Canvas from 'react-native-canvas';
import { SafeAreaView } from 'react-navigation'
import { StatusBar } from 'expo-status-bar';
import Spinner from 'react-native-loading-spinner-overlay';

// Services
import TextractAPI from '../services/textractAPI';
import WordSearchSolver from '../services/wordSearchSolver';
import WordSearchSolutionDrawer from '../services/wordSearchSolutionDrawer';

// Styles
import buttonStyles from '../config/buttons';
import colors from '../config/colors';
import preload from '../assets/preload.png';

export default class SolutionScreen extends React.Component {
	static get CANVAS_PADDING() {
		return 10;
	}

	state = {
		spinner: false
	}

	handleCanvas() {
		if (this.state.canvas != null) {
			this.setState({ spinner: true });
			this.state.canvas.width = this.state.width - SolutionScreen.CANVAS_PADDING;
			this.state.canvas.height = this.state.height - SolutionScreen.CANVAS_PADDING;
			let textractApi = new TextractAPI();
			textractApi.detectDocumentText(this.state.base64, (data) => {
				let awsTextractResponse = data;
				let solver = new WordSearchSolver(awsTextractResponse.Blocks);
				let searchableWords = solver.getWordsToSearch();
				let foundWords = solver.findWords(Object.keys(searchableWords));
				var drawer = new WordSearchSolutionDrawer(this.state.canvas, this.state.base64, searchableWords);
				drawer.colorBoard({
					rows: foundWords.rows,
					columns: foundWords.columns,
					bottomLeftDiagonals: foundWords.bottomLeftDiagonals,
					bottomRightDiagonals: foundWords.bottomRightDiagonals
				}, () => {
					this.setState({ spinner: false });
				});
			});
		}
	}

	static getDerivedStateFromProps(props, state) {
		if (props && props.navigation && props.navigation.state && props.navigation.state.params) {
			return {
				base64: props.navigation.state.params.base64,
			};
		}

		return null;
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.base64 !== this.state.base64) {
			this.handleCanvas();
		}
	}

	render() {
		return (
			<SafeAreaView style={styles.container}>
				<StatusBar style="light" />
				<Spinner
					visible={this.state.spinner}
					textContent={'Loading...'}
					textStyle={styles.spinnerTextStyle}
					color={colors.mint}
				/>

				<View style={styles.canvasView} onLayout={(event) => {
					this.state.width = event.nativeEvent.layout.width;
					this.state.height = event.nativeEvent.layout.height;
				}}>
					<Image style={styles.preload}
						source={preload}
					/>
					<Canvas ref={canvas => { this.state.canvas = canvas; }} style={styles.canvas} />
				</View>
				<TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('Camera')}>
					<Text style={buttonStyles.buttonPrimary}>Solve</Text>
				</TouchableWithoutFeedback>
			</SafeAreaView>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.slateGrey,
		alignItems: 'center',
		justifyContent: 'center'
	},
	canvasView: {
		backgroundColor: colors.lightGrey,
		position: 'absolute',
		top: 15,
		borderRadius: 5,
		width: '90%',
		height: '85%',
		padding: 5
	},
	preload: {
		position: 'absolute',
		borderRadius: 5,
		resizeMode: 'cover',
		width: '100%',
		height: '100%'
	}
});